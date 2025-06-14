import { error, info } from '@tauri-apps/plugin-log';
import Database from '@tauri-apps/plugin-sql';
import FileSystem from './fileSystem';

class ClipboardDB {
    private db: Database | undefined;
    private static instance: ClipboardDB | null = null;
    private initialized: Promise<void>;

    constructor() {
        this.initialized = this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            this.db = await Database.load('sqlite:clipboard.db');
            await this.initDatabase();
            info('[数据库进程] 数据库初始化完成');
        } catch (er: any) {
            error('[数据库进程] 数据库加载失败:' + er.message);
            throw er;
        }
    }

    public static async getInstance(): Promise<ClipboardDB> {
        if (!ClipboardDB.instance) {
            ClipboardDB.instance = new ClipboardDB();
            // 确保数据库已初始化
            await ClipboardDB.instance.initialized;
        }
        return ClipboardDB.instance;
    }

    async initDatabase() {
        try {
            // 创建剪贴板项目表
            await this.db?.execute(`
                CREATE TABLE IF NOT EXISTS clipboard_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    copy_time INTEGER NOT NULL,
                    is_topped BOOLEAN DEFAULT 0,
                    top_time INTEGER,
                    type TEXT DEFAULT 'text',
                    file_path TEXT
                )
            `);
            // 创建标签表
            await this.db?.execute(`
                CREATE TABLE IF NOT EXISTS tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    color TEXT,
                    created_at INTEGER NOT NULL
                )
            `);

            // 创建剪贴板条目和标签的关联表
            await this.db?.execute(`
                CREATE TABLE IF NOT EXISTS item_tags (
                    item_id INTEGER,
                    tag_id INTEGER,
                    FOREIGN KEY (item_id) REFERENCES clipboard_items (id) ON DELETE CASCADE,
                    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
                    PRIMARY KEY (item_id, tag_id)
                )
            `);

            info('[数据库进程] 数据库表初始化成功');
        } catch (er: any) {
            error('[数据库进程] 数据库表初始化失败:' + er.message);
            throw er;
        }
    }


    /**
     * 保存剪贴板项目到数据库
     * @param content 内容
     * @param type 类型
     * @param filePath 文件路径
     */
    async saveClipboardItem(content: string, type: string = 'text', filePath: string | null = null) {
        // info("[数据库进程] 剪贴板内容添加开始" + JSON.stringify([content, type, filePath]));

        try {
            // 覆盖相同内容的旧记录的复制时间
            if (type === 'text') {
                info("[数据库进程] 查询相同文本内容的旧记录");
                const row = await this.db?.select('SELECT id FROM clipboard_items WHERE content = ? AND type = ?', [content, type]) as [{ id: number }];
                if (row && row.length > 0) {
                    await this.updateItemTime(row[0].id, Date.now());
                    info("[数据库进程] 有查询到相同文本内容的记录，覆盖复制时间");
                    return;
                }
            } else if (filePath) {
                info("[数据库进程] 查询相同文件路径的旧记录");
                const row = await this.db?.select('SELECT id FROM clipboard_items WHERE type = ? AND file_path = ?', [type, filePath]) as [{ id: number }];
                if (row && row.length > 0) {
                    await this.updateItemTime(row[0].id, Date.now());
                    info("[数据库进程] 有查询到相同文件内容的记录，覆盖复制时间");
                    return;
                }
            }

            info("[数据库进程] 准备插入新的剪贴板记录");
            await this.db?.execute('INSERT INTO clipboard_items (content, copy_time, type, file_path) VALUES (?, ?, ?, ?)', [content, Date.now(), type, filePath]);
            info("[数据库进程] 剪贴板内容添加成功");
        } catch (err: any) {
            error("[数据库进程] 剪贴板内容添加失败", err.message);
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
     * 分页搜索剪贴板内容
     * 支持按内容和标签ID进行搜索，并支持分页
     * @param {string} content 搜索内容关键词
     * @param {number} tagId 标签ID
     * @param {number} page 页码，从1开始
     * @param {number} pageSize 每页条数
     * @returns {Object} 包含总条数和当前页数据的对象
     */
    async searchItemsPaged(content: string | undefined, tagId: number | undefined, page: number = 1, pageSize: number = 10): Promise<{ total: number; items: ClipboardItem[]; }> {
        // 构建基础SQL查询，用于计算总条数
        let countSql = 'SELECT COUNT(DISTINCT ci.id) as total FROM clipboard_items ci';
        const countParams = [];

        // 构建基础SQL查询，获取符合条件的剪贴板条目
        let itemsSql = 'SELECT DISTINCT ci.*, ('
            + 'SELECT json_group_array(json_object('
            + "'id', t.id, 'name', t.name, 'color', t.color, 'created_at', t.created_at"
            + ')) FROM tags t'
            + ' INNER JOIN item_tags it ON t.id = it.tag_id'
            + ' WHERE it.item_id = ci.id'
            + ') as tags_json FROM clipboard_items ci';
        const itemsParams = [];

        // 根据标签ID构建查询条件
        if (tagId && tagId !== null) {
            // 通过关联表连接标签和剪贴板条目
            const joinClause = ' INNER JOIN item_tags it ON ci.id = it.item_id'
                + ' INNER JOIN tags t ON it.tag_id = t.id'
                + ' WHERE t.id = ?';
            countSql += joinClause;
            itemsSql += joinClause;
            countParams.push(tagId);
            itemsParams.push(tagId);
        }

        // 根据内容关键词构建查询条件
        if (content && content !== null && content !== '') {
            const whereClause = (tagId && tagId !== null) ? ' AND ci.content LIKE ?' : ' WHERE ci.content LIKE ?';
            countSql += whereClause;
            itemsSql += whereClause;
            countParams.push(`%${content}%`);
            itemsParams.push(`%${content}%`);
        }

        // 添加排序条件：先按置顶状态，再按时间排序
        itemsSql += ' ORDER BY ci.is_topped DESC, CASE WHEN ci.is_topped = 1 THEN ci.top_time ELSE ci.copy_time END DESC';

        // 添加分页限制
        const offset = (page - 1) * pageSize;
        itemsSql += ' LIMIT ? OFFSET ?';
        itemsParams.push(pageSize, offset);

        // 获取总条数
        const countResult = await this.db?.select(countSql, countParams) as any[];
        const total = countResult[0].total;
        // info('[数据库进程] 查总条数sql：' + countSql + '，参数：' + JSON.stringify(countParams) + '，查询结果：' + total);
        if (!total || total <= 0) {
            return { total: 0, items: [] };
        }

        // 获取符合条件的剪贴板条目
        const items = await this.db?.select(itemsSql, itemsParams) as any[];

        // 处理JSON字符串为JavaScript对象
        for (const item of items) {
            try {
                item.tags = item.tags_json ? JSON.parse(item.tags_json) : [];
                delete item.tags_json; // 删除原始JSON字符串字段
            } catch (err: any) {
                error('[数据库进程] 解析标签JSON失败:' + err.message);
                item.tags = [];
            }
        }

        // info('[数据库进程] 查明细数sql：' + itemsSql + '，参数：' + JSON.stringify(itemsParams));

        return { total, items };
    }

    /**
     * 置顶或取消置顶剪贴板项目
     */
    async toggleTopClipboardItem(id: number, isTopped: boolean) {
        const now = Date.now();

        try {
            await this.db?.execute(
                `UPDATE clipboard_items SET is_topped = ?, top_time = ? WHERE id = ?`,
                [isTopped ? 1 : 0, isTopped ? now : null, id]
            );
            return true;
        } catch (err: any) {
            error('[数据库进程] 更新剪贴板项目置顶状态失败:' + err.message);
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
                // 删除文件
                if (item[0].type === 'image') {
                    const fileSystem = await FileSystem.getInstance();
                    await fileSystem.removeImageFile(item[0].file_path);
                }
                // 删除数据
                await this.db?.execute('DELETE FROM clipboard_items WHERE id = ?', [id]);
                await this.db?.execute('DELETE FROM item_tags WHERE item_id = ?', [id]);
            }
            return true;
        } catch (err: any) {
            error('[数据库进程] 删除剪贴板项目失败:' + err.message);
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
                // 删除所有图片文件
                info('[数据库进程] 开始删除文件...');
                const fileSystem = await FileSystem.getInstance();
                await fileSystem.removeImageFolder();
                // 清空数据库记录
                info('[数据库进程] 正在清空数据库记录...');
                await this.db?.execute('DELETE FROM clipboard_items');
                await this.db?.execute('DELETE FROM item_tags');

                info('[数据库进程] 剪贴板内容和临时文件清理完成');
                resolve();
            } catch (err: any) {
                error('[数据库进程] 清空剪贴板时发生错误:' + err.message);
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
        return await this.db?.select('SELECT * FROM clipboard_items WHERE id = ?', [id]);
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
        await this.db?.execute('DELETE FROM item_tags WHERE tag_id = ?', [tagId]);
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
        return await this.db?.select('SELECT * FROM tags ORDER BY created_at ASC');
    }

    /**
     * 剪贴板条目绑定标签
     * @param {number} itemId 剪贴板条目ID
     * @param {number} tagId 标签ID
     */
    async addItemTag(itemId: number, tagId: number) {
        await this.db?.execute('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)', [itemId, tagId]);
    }

    /**
     * 移除剪贴板条目的标签
     * @param {number} itemId 剪贴板条目ID
     * @param {number} tagId 标签ID
     */
    async removeItemTag(itemId: number, tagId: number) {
        await this.db?.execute('DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?', [itemId, tagId]);
    }

    /**
     * 获取剪贴板条目的所有标签
     * @param {number} itemId 剪贴板条目ID
     * @returns {Array} 标签数组
     */
    async getItemTags(itemId: number): Promise<TagItem[] | undefined> {
        return await this.db?.select('SELECT t.* FROM tags t INNER JOIN item_tags it ON t.id = it.tag_id WHERE it.item_id = ?', [itemId]);
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
}

export default ClipboardDB;