!macro NSIS_HOOK_POSTINSTALL

      ; 定义变量
      StrCpy $0 "chinese"; 用于存储目标语言字符串，如 "chinese"

      ; 根据 $LANGUAGE 进行映射
      ${If} $LANGUAGE == "SimpChinese"
          StrCpy $0 "chinese"
      ${ElseIf} $LANGUAGE == "English"
          StrCpy $0 "english"
      ${Else}
          StrCpy $0 "chinese"  ; 默认语言
      ${EndIf}

      ; 创建目录（如果不存在）
      CreateDirectory "$APPDATA\com.lin.EasyPaste"

      ; 判断 settings.json 是否已存在，若不存在才执行写入操作
      IfFileExists "$APPDATA\com.lin.EasyPaste\settings.json" +3 0
          ; 文件不存在时的操作
          FileOpen $1 "$APPDATA\com.lin.EasyPaste\settings.json" w
          FileWrite $1 '{"languages":"'
          FileWrite $1 $0
          FileWrite $1 '"}'
          FileClose $1

      ; 删除程序启动记录
      Delete "$APPDATA\com.lin.EasyPaste\run.json"
!macroend