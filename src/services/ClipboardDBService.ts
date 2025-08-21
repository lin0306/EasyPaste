import {error, info} from '@tauri-apps/plugin-log';
import Database from '@tauri-apps/plugin-sql';
import DataClearService from './DataClearService';

class ClipboardDBService {
    private db: Database | undefined;
    private static instance: ClipboardDBService | null = null;
    private initialized: Promise<void>;

    constructor() {
        this.initialized = this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            this.db = await Database.load('sqlite:clipboard.db');
            await this.initDatabase();
            info('[数据库进程] 数据库初始化完成');
        } catch (er) {
            error('[数据库进程] 数据库加载失败:' + er);
            throw er;
        }
    }

    public static async getInstance(): Promise<ClipboardDBService> {
        if (!ClipboardDBService.instance) {
            ClipboardDBService.instance = new ClipboardDBService();
            // 确保数据库已初始化
            await ClipboardDBService.instance.initialized;
        }
        return ClipboardDBService.instance;
    }

    async initDatabase() {
        try {
            // 创建剪贴板项目表
            await this.db?.execute(`
                CREATE TABLE IF NOT EXISTS clipboard_items
                (
                    id        INTEGER PRIMARY KEY AUTOINCREMENT,
                    content   TEXT    NOT NULL,
                    chars     INTEGER,
                    copy_time INTEGER NOT NULL,
                    is_topped BOOLEAN DEFAULT 0,
                    top_time  INTEGER,
                    type      TEXT    DEFAULT 'text',
                    file_path TEXT
                )
            `);
            // 创建标签表
            await this.db?.execute(`
                CREATE TABLE IF NOT EXISTS tags
                (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    name       TEXT    NOT NULL UNIQUE,
                    color      TEXT,
                    created_at INTEGER NOT NULL
                )
            `);

            // 创建剪贴板条目和标签的关联表
            await this.db?.execute(`
                CREATE TABLE IF NOT EXISTS item_tags
                (
                    item_id INTEGER,
                    tag_id  INTEGER,
                    FOREIGN KEY (item_id) REFERENCES clipboard_items (id) ON DELETE CASCADE,
                    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
                    PRIMARY KEY (item_id, tag_id)
                )
            `);

            const clipboardItemsInfo = await this.db?.select<[{
                cid: number,
                name: string
            }]>(`PRAGMA table_info(clipboard_items)`);
            const clipboardItemsColumnExists = clipboardItemsInfo?.some((col) => col.name === 'chars')
            if (!clipboardItemsColumnExists) {
                // 增加字符数字段
                await this.db?.execute(`
                    alter table clipboard_items
                        add chars integer;
                `);
            }
        } catch (er) {
            error('[数据库进程] 数据库表初始化失败:' + er);
            throw er;
        }
    }

    /**
     * 保存剪贴板项目到数据库
     * @param content 内容
     * @param type 类型
     */
    async saveClipboardItem(content: string, type: string) {
        try {
            // 覆盖相同内容的旧记录的复制时间
            if (type === 'text') {
                const row = await this.db?.select('SELECT id FROM clipboard_items WHERE content = ? AND type = ?', [content, type]) as [{
                    id: number
                }];
                if (row && row.length > 0) {
                    await this.updateItemTime(row[0].id, Date.now());
                    info("[数据库进程] 有查询到相同文本内容的记录，覆盖复制时间");
                    return;
                }
                await this.db?.execute('INSERT INTO clipboard_items (content, copy_time, type, file_path, chars) VALUES (?, ?, ?, ?, ?)', [content, Date.now(), type, null, content.length]);
            }
            if (type === 'file') {
                const row = await this.db?.select('SELECT id FROM clipboard_items WHERE type = ? AND file_path = ?', [type, content]) as [{
                    id: number
                }];
                if (row && row.length > 0) {
                    await this.updateItemTime(row[0].id, Date.now());
                    info("[数据库进程] 有查询到相同文件内容的记录，覆盖复制时间");
                    return;
                }
                await this.db?.execute('INSERT INTO clipboard_items (content, copy_time, type, file_path) VALUES (?, ?, ?, ?)', [null, Date.now(), type, content]);
            }
            // 清理历史数据
            const clearTimer = await DataClearService.getInstance();
            await clearTimer.dataClear();
            info("[数据库进程] 剪贴板内容添加成功");
        } catch (err) {
            error("[数据库进程] 剪贴板内容添加失败" + err);
            throw err;
        }
    }

    /**
     * 更新剪贴板条目的复制时间
     * @param {number} id 条目ID
     * @param {number} newTime 新的复制时间
     */
    async updateItemTime(id: number, newTime: number) {
        await this.db?.execute('UPDATE clipboard_items SET copy_time = ? WHERE id = ?', [newTime, id]);
    }

    /**
     * 搜索剪贴板项目 - 游标分页，降低查询性能
     * @link <a href="https://lxblog.com/qianwen/share?shareId=2d2509e7-a486-4b7a-a18d-49fb85826cfb">查询逻辑设计来源</a>
     * @param content 搜索内容
     * @param tagId 标签ID
     * @param pageSize 每页数量
     * @param lastItemId 上一页最后一个条目ID
     */
    async searchItems(content?: string, tagId?: number, pageSize: number = 10, lastItemId?: number): Promise<{
        total: number;
        items: ClipboardItem[];
    }> {
        try {
            // 初始化sql前缀
            let itemsSql = `
                select ci.*,
                       iif(t.id is null, null,
                           json_group_array(
                                   json_object('id', t.id, 'name', t.name, 'color', t.color, 'created_at', t.created_at)
                           )
                       ) as tags_json
                from clipboard_items ci
                         left join item_tags it on ci.id = it.item_id
                         left join tags t on it.tag_id = t.id
                where 1 = 1
            `;
            let countSql = `
                select COUNT(DISTINCT ci.id) as total
                from clipboard_items ci
                         left join item_tags it on ci.id = it.item_id
                         left join tags t on it.tag_id = t.id
                where 1 = 1
            `;

            // 初始化查询参数
            const queryParams = [];
            const countParams = [];

            // 传了id，查的不是第一页
            if (lastItemId) {
                const items = await this.getItem(lastItemId);
                if (items && items.length > 0) {
                    const latestItem = items[0];
                    // sql有点复杂，具体解释如下：
                    // -- 条件1：当前记录的“置顶状态” > 上一条（即从非置顶跳到置顶区不可能，所以只可能是同区或下一个区）
                    // -- 我们分三种情况：
                    //
                    // -- 情况1：当前记录在“置顶区”，且比上一条的 top_time 更新
                    // (ci.top_time IS NOT NULL
                    //  AND (CASE WHEN ? IS NULL THEN 1 ELSE 0 END = 0)  -- 上一条不是置顶（即上一条在非置顶区）
                    // )
                    // OR
                    // -- 情况2：都在置顶区，但 top_time 更晚，或 top_time 相同但 id 更小
                    // (ci.top_time IS NOT NULL
                    //  AND ? IS NOT NULL
                    //  AND (
                    //    ci.top_time < ?
                    //    OR (ci.top_time = ? AND a.id < ?)
                    //  )
                    // )
                    // OR
                    // -- 情况3：当前在非置顶区（即上一条已经是非置顶区或当前就是非置顶）
                    // (ci.top_time IS NULL
                    //  AND (
                    //    -- 上一条是置顶区：直接进入非置顶区
                    //    ? IS NULL
                    //    OR
                    //    -- 上一条也是非置顶区：按 copy_time 和 id 继续
                    //    (ci.copy_time < ?
                    //     OR (ci.copy_time = ? AND ci.id < ?)
                    //    )
                    //  )
                    // )
                    //
                    // 参数说明（按顺序传参）
                    // 第一个 ? 参数：上一条记录的 top_time（用于判断是否还在置顶区）
                    // 第二个 ? 参数：上一条记录的 top_time（用于比较）
                    // 第三个 ? 参数：上一条记录的 top_time（用于 = 判断）
                    // 第四个 ? 参数：上一条记录的 ci.id（用于 = 时 id 比较）
                    // 第五个 ? 参数：上一条记录的 top_time（判断是否已进入非置顶区）
                    // 第六个 ? 参数：上一条记录的 copy_time
                    // 第七个 ? 参数：上一条记录的 copy_time
                    // 第八个 ? 参数：上一条记录的 ci.id

                    itemsSql += `
                        AND 
                        (
                            (
                                ci.top_time IS NOT NULL 
                                AND (CASE WHEN ? IS NULL THEN 1 ELSE 0 END = 0)
                            )
                            OR (
                                ci.top_time IS NOT NULL 
                                AND ? IS NOT NULL 
                                AND ( ci.top_time < ? OR (ci.top_time = ? AND ci.id < ?) )
                            )
                            OR (
                                ci.top_time IS NULL 
                                AND ( ? IS NULL OR ( ci.copy_time < ? OR (ci.copy_time = ? AND ci.id < ?) ) )
                            )
                        )
                    `;
                    queryParams.push(latestItem.top_time);
                    queryParams.push(latestItem.top_time);
                    queryParams.push(latestItem.top_time);
                    queryParams.push(latestItem.top_time);
                    queryParams.push(latestItem.id);
                    queryParams.push(latestItem.top_time);
                    queryParams.push(latestItem.copy_time);
                    queryParams.push(latestItem.copy_time);
                    queryParams.push(latestItem.id);
                }
            }

            // 生成查询参数
            if (tagId) {
                itemsSql += `and t.id = ?`;
                countSql += `and t.id = ?`;
                queryParams.push(tagId);
                countParams.push(tagId);
            }

            if (content && content.trim() !== '') {
                itemsSql += `and (ci.content LIKE ? or ci.file_path LIKE ?)`;
                countSql += `and (ci.content LIKE ? or ci.file_path LIKE ?)`;
                queryParams.push(`%${content}%`);
                queryParams.push(`%${content}%`);
                countParams.push(`%${content}%`);
                countParams.push(`%${content}%`);
            }


            // 拼接过滤参数
            itemsSql += `
                group by ci.id, ci.top_time, ci.copy_time
                order by ci.top_time desc, ci.copy_time desc, ci.id desc
            `;

            // 拼接分页
            itemsSql += ` limit ?`;
            queryParams.push(pageSize);

            // 获取总条数
            const countResult = await this.db?.select(countSql, countParams) as [{ total: number }];
            const total = countResult[0].total;
            if (!total || total <= 0) {
                return {total: 0, items: []};
            }

            // 获取符合条件的剪贴板条目
            const items = await this.db?.select(itemsSql, queryParams) as any[];

            // 处理JSON字符串为JavaScript对象
            for (const item of items) {
                try {
                    item.tags = item.tags_json ? JSON.parse(item.tags_json) : [];
                } catch (err) {
                    error('[数据库进程] 解析标签JSON失败，itemId:' + item.id + ':' + err);
                    item.tags = [];
                }
            }

            return {total, items};
        } catch (e) {
            console.error('[数据库进程] 获取剪贴板条目失败:' + e);
            return {total: 0, items: []};
        }
    }

    /**
     * 置顶或取消置顶剪贴板项目
     */
    async toggleTopClipboardItem(id: number, isTopped: boolean) {
        const now = Date.now();

        try {
            await this.db?.execute(
                `UPDATE clipboard_items
                 SET is_topped = ?,
                     top_time  = ?
                 WHERE id = ?`,
                [isTopped ? 1 : 0, isTopped ? now : null, id]
            );
            return true;
        } catch (err) {
            error('[数据库进程] 更新剪贴板项目置顶状态失败:' + err);
            return false;
        }
    }

    /**
     * 删除剪贴板项目
     */
    async deleteClipboardItem(id: number) {
        try {
            const item = await this.getItem(id);
            if (item && item.length > 0) {
                // 删除数据
                await this.db?.execute('DELETE FROM clipboard_items WHERE id = ?', [id]);
            }
            return true;
        } catch (err) {
            error('[数据库进程] 删除剪贴板项目失败:' + err);
            return false;
        }
    }

    /**
     * 删除项目的标签
     * @param itemId 项目id
     * @param tagId 标签id
     * @returns
     */
    async deleteClipboardItemTag(itemId: number, tagId: number) {
        try {
            const item = await this.db?.select('SELECT * FROM item_tags WHERE item_id = ? AND tag_id = ?', [itemId, tagId]);
            if (item) {
                // 删除数据
                await this.db?.execute('DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?', [itemId, tagId]);
            }
            return true;
        } catch (err) {
            console.log(err)
            error('[数据库进程] 删除剪贴板项目失败:' + err);
            return false;
        }
    }

    /**
     * 清空所有剪贴板条目
     * 删除所有图片文件并清空数据库记录
     * @returns {Promise<void>} 完成清空操作的Promise
     */
    clearAll(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                // 清空数据库记录
                info('[数据库进程] 正在清空数据库记录...');
                await this.db?.execute('DELETE FROM clipboard_items');

                info('[数据库进程] 剪贴板内容清理完成');
                resolve();
            } catch (err) {
                error('[数据库进程] 清空剪贴板时发生错误:' + err);
                reject(err);
            }
        });
    }

    /**
     * 根据剪贴板条目id获取条目信息
     * @param id 条目id
     * @returns 条目信息
     */
    async getItem(id: number): Promise<ClipboardItem[] | undefined> {
        return this.db?.select('SELECT * FROM clipboard_items WHERE id = ?', [id]);
    }

    /**
     * 获取最新条目
     */
    async getLatestItem(): Promise<ClipboardItem[] | undefined> {
        return this.db?.select('SELECT * FROM clipboard_items ORDER BY copy_time DESC LIMIT 1');
    }

    // 标签相关的方法
    /**
     * 添加新标签
     * @param {string} name 标签名称
     * @param {string} color 标签颜色
     */
    async addTag(name: string, color: string) {
        await this.db?.execute('INSERT INTO tags (name, color, created_at) VALUES (?, ?, ?)', [name, color, Date.now()]);
    }

    /**
     * 删除标签
     * @param {number} tagId 标签ID
     */
    async deleteTag(tagId: number) {
        await this.db?.execute('DELETE FROM tags WHERE id = ?', [tagId]);
    }

    /**
     * 更新标签
     * @param {number} id 标签ID
     * @param {string} name 标签名称
     * @param {string} color 标签颜色
     */
    async updateTag(id: number, name: string, color: string) {
        await this.db?.execute('UPDATE tags SET name = ?, color = ? WHERE id = ?', [name, color, id]);
    }

    /**
     * 获取所有标签
     * @returns {Array} 标签数组，按创建时间升序排列
     */
    async getAllTags(): Promise<TagItem[] | undefined> {
        return this.db?.select(`
            select 
                t.*,
                sum(iif(it.item_id is null , 0, 1)) as stats
            from tags t
                     left join item_tags it on t.id = it.tag_id
            group by t.id, t.created_at
            order by t.created_at
        `);
    }

    /**
     * 将剪贴板条目绑定到标签
     * 检查标签是否存在，避免重复绑定
     * @param {number} itemId 剪贴板条目ID
     * @param {number|string} tagId 标签ID
     * @throws {Error} 当标签不存在时抛出错误
     */
    async bindItemToTag(itemId: number, tagId: any) {
        // 验证标签是否存在
        const tag = await this.db?.select('SELECT id FROM tags WHERE id = ?', [tagId]) as [{ id: number }];
        if (!tag || tag.length <= 0) {
            throw new Error('标签不存在');
        }
        // 检查标签是否已经绑定
        const bindInfo = await this.db?.select('SELECT * FROM item_tags WHERE item_id = ? AND tag_id = ?', [itemId, tag[0].id]) as any[];
        if (bindInfo && bindInfo.length > 0) {
            info('[数据库进程] 标签已绑定');
            return;
        }
        // 标签未绑定，执行绑定操作
        await this.db?.execute('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)', [itemId, tag[0].id]);
    }

    /**
     * 获取最新的标签
     */
    async getLatestTag(): Promise<TagItem[] | undefined> {
        return this.db?.select('SELECT * FROM tags ORDER BY created_at DESC LIMIT 1');
    }

    /**
     * 删除指定天数之前的剪贴板条目
     * @param days 保留天数
     * @returns 删除条目数量
     */
    async clearClipboardItems(days: number): Promise<number> {
        if (days && days > 0) {
            let now = new Date();
            now.setDate(now.getDate() - days);
            let counts = await this.db?.select('SELECT COUNT(*) as count FROM clipboard_items WHERE copy_time < ?', [now.getTime()]) as [{
                count: number
            }];
            if (counts && counts.length > 0 && counts[0].count > 0) {
                info('[数据库进程] 清理过期剪贴板条目');
                await this.db?.execute('DELETE FROM clipboard_items WHERE copy_time < ?', [now.getTime()]);
                return counts[0].count;
            }
        }

        return 0;
    }

    /**
     * 清理超过保留时长的数据
     */
    async clearHistoryItems(maxCount: number): Promise<number> {
        if (maxCount && maxCount > 0) {
            // 获取可以保留的最早一条数据
            let items = await this.db?.select<ClipboardItem[]>('SELECT * FROM clipboard_items ORDER BY copy_time DESC LIMIT 1 OFFSET ?', [maxCount - 1]);
            if (items && items.length > 0) {
                let counts = await this.db?.select('SELECT COUNT(*) as count FROM clipboard_items WHERE copy_time < ?', [items[0].copy_time]) as [{
                    count: number
                }];
                if (counts && counts.length > 0 && counts[0].count) {
                    info('[数据库进程] 清理超过保留时长的数据');
                    await this.db?.execute('DELETE FROM clipboard_items WHERE copy_time < ?', [items[0].copy_time]);
                    return counts[0].count;
                }
            }
        }
        return 0;
    }
}

export default ClipboardDBService;