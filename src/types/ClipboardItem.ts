interface ClipboardItem {
  id: number;
  content: string;
  copy_time: number;
  is_topped: number;
  top_time: number | null;
  type: string;
  file_path: string;
  tags: TagItem[],
  chars: number;
}

interface TagItem {
  id: number,
  name: string,
  color: string,
  created_at: Date
}
