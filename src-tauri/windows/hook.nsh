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

      ; 写入 JSON 文件
      FileOpen $1 "$APPDATA\com.lin.EasyPaste\userSettings.json" w
      FileWrite $1 '{"languages":"'
      FileWrite $1 $0
      FileWrite $1 '"}'
      FileClose $1

!macroend