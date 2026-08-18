// Zed keymap
//
// For information on binding keys, see the Zed
// documentation: https://zed.dev/docs/key-bindings
//
// To see the default key bindings run `zed: open default keymap`
// from the command palette.
[
  {
    "context": "Workspace",
    "bindings": {
      // "shift shift": "file_finder::Toggle"
    },
  },
  {
    "context": "Editor && vim_mode == insert",
    "bindings": {
      // "j k": "vim::NormalBefore"
    },
  },
  {
    "context": "vim_mode == visual",
    "bindings": {
      "shift-s": "vim::PushAddSurrounds"
    }
  },
{
  "context": "Dock",
  "bindings": {
    "ctrl-w h": "workspace::ActivatePaneLeft",
    "ctrl-w l": "workspace::ActivatePaneRight",
    "ctrl-w k": "workspace::ActivatePaneUp",
    "ctrl-w j": "workspace::ActivatePaneDown"
    // ... or other keybindings
  }
},
{
  "context": "VimControl && !menu && vim_mode != operator",
  "bindings": {
    "w": "vim::NextSubwordStart",
    "b": "vim::PreviousSubwordStart",
    "e": "vim::NextSubwordEnd",
    "g e": "vim::PreviousSubwordEnd"
  }
},
// {
//   "context": "vim_mode == normal || vim_mode == visual",
//   "bindings": {
//     "s": "vim::PushSneak",
//     "shift-s": "vim::PushSneakBackward"
//   }
// },
// This key binding will work when you're editing a file. It comes built into Zed by default as the workspace: save command.
{
  "context": "Workspace",
  "bindings": {
    "ctrl-s": "workspace::Save"
  }
},
{
  "context": "Editor",
  "bindings": {
    "ctrl-s": "workspace::Save"
  }
},
{
   "context": "Editor && VimControl && !VimWaiting && !menu",
   "bindings": {
     // 1. Helix 오리지널 단축키 선호 시: g 입력 후 w를 누르면 점프 발동
     "g w": "vim::HelixJumpToWord",

     // 2. 단축키 하나로 편하게 쓰고 싶다면: s 키에 바로 할당
     // "s": "vim::HelixJumpToWord"
   }
 }
]
