vim.g.mapleader = " " -- 리더 키를 스페이스바로 설정

-- 기본 옵션
-- 라인 번호 표시
vim.opt.nu = true

-- 상대적 라인 번호 표시 (커서 위치 기준)
vim.opt.rnu = true

-- 탭 관련 설정
vim.opt.tabstop = 2         -- 탭의 크기
vim.opt.shiftwidth = 2      -- 자동 들여쓰기 크기
vim.opt.expandtab = true    -- 탭을 공백으로 변환

-- 검색 관련 설정
vim.opt.incsearch = true    -- 입력하는 즉시 검색 결과 하이라이트
vim.opt.hlsearch = true     -- 모든 검색 결과 하이라이트 유지

-- 기타 유용한 옵션
vim.opt.termguicolors = true   -- 터미널 색상 활성화
vim.opt.clipboard = "unnamedplus" -- 시스템 클립보드와 연동
vim.opt.signcolumn = "yes"     -- 기호 열(sign column) 항상 표시
vim.opt.ignorecase = true -- 대소문자 무시

-- Yank 하이라이트
vim.api.nvim_create_autocmd("TextYankPost", {
  callback = function() vim.highlight.on_yank() end,
})

-- ~/.config/nvim/init.lua 파일 내용
-- lazy.nvim 설치 코드 (lazy.nvim의 공식 문서를 참고하여 최신 코드를 사용하세요)
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- lazy.nvim 셋업
require("lazy").setup({
  -- 여기에 사용할 플러그인 목록을 추가합니다.
  -- 예: 테마 플러그인
  {
	"kylechui/nvim-surround",
	version = "^3.0.0", -- Use for stability; omit to use `main` branch for the latest features
	event = "VeryLazy",
	config = function()
	  require("nvim-surround").setup({
	      -- Configuration here, or leave empty to use defaults
	  })
	end
  },
  -- 아이콘
  { "nvim-tree/nvim-web-devicons", lazy = true, opts = { default = true } },

  -- 상태줄
  {
    "nvim-lualine/lualine.nvim",
    event = "VeryLazy",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require("lualine").setup({ options = { theme = "tokyonight", icons_enabled = true } })
    end,
  },  
--------------------------------
-- Telescope 키 매핑
--------------------------------
  {
    'nvim-telescope/telescope.nvim',
    tag = '0.1.4', -- 원하는 버전으로 설정
    dependencies = { 'nvim-lua/plenary.nvim' },
    config = function()
        local telescope = require("telescope.builtin")
        vim.keymap.set('n', '<leader>ff', telescope.find_files, { desc = '[F]ind [F]iles' })
        vim.keymap.set('n', '<leader>fg', telescope.live_grep, { desc = '[F]ind by [G]rep' })
        vim.keymap.set('n', '<leader>fb', telescope.buffers, { desc = '[F]ind [B]uffers' })
        vim.keymap.set('n', '<leader>fh', telescope.help_tags, { desc = '[F]ind [H]elp Tags' })
    end
  },  
 -- 카멜케이스 모션
  {
    "bkad/CamelCaseMotion",
    -- 원하는 경우 키맵 설정 추가
    config = function()
        -- CamelCaseMotion leader 키 설정 (선택)
        vim.g.camelcasemotion_key = '<leader>'
        -- 모드와 모션 목록
        local modes = { 'n', 'x', 'o' }       -- n: normal, x: visual, o: operator-pending
        local motions = { 'w', 'b', 'e', 'ge' }
        -- 각 모드에 대해 CamelCaseMotion 플러그인 매핑
        for _, mode in ipairs(modes) do
          for _, motion in ipairs(motions) do
            vim.keymap.set(mode, motion, '<Plug>CamelCaseMotion_' .. motion, { silent = true })
            vim.keymap.set(mode, '<leader>' .. motion, '<Plug>CamelCaseMotion_' .. motion, { silent = true })
          end
        end
    end
  },
-- easy motion
    {
        "easymotion/vim-easymotion",
        config = function()
            -- EasyMotion 기본 설정
            -- leader + s 로 단어 찾기, leader + f 로 문자 찾기
            vim.g.EasyMotion_do_mapping = 0  -- 기본 매핑 끄기 (직접 설정 위해)
            local opts = { noremap = true, silent = true }
            -- 단어 찾기 (leader + s)
            vim.api.nvim_set_keymap('n', '<leader>s', '<Plug>(easymotion-s)', opts)
            -- 문자 찾기 (leader + f)
            vim.api.nvim_set_keymap('n', '<leader>f', '<Plug>(easymotion-f)', opts)
            -- Visual 모드에서도 사용 가능
            vim.api.nvim_set_keymap('x', '<leader>s', '<Plug>(easymotion-s)', opts)
            vim.api.nvim_set_keymap('x', '<leader>f', '<Plug>(easymotion-f)', opts)
        end
    },
--  셰션저장 플러그인 설정
  {
    'folke/persistence.nvim',
    event = "BufReadPre",
    config = function()
      require("persistence").setup({
        -- 세션이 저장될 디렉터리 경로
        dir = vim.fn.stdpath("data") .. "/sessions/",
        -- 저장할 옵션 (버퍼, 현재 디렉터리 등)
        options = { "buffers", "curdir", "tabpages", "winsize" },
        -- 자동 저장 활성화
        auto_save = true,
      })
    end
  },
-- 문법
  {
    'nvim-treesitter/nvim-treesitter',
      build = ':TSUpdate',
      event = {'BufReadPre', 'BufNewFile'},    
     config = function()
      require('nvim-treesitter.configs').setup({
        -- 구문 강조
        highlight = {
          enable = true,
          -- 코드 블록이나 주석 내에서 특정 언어만 비활성화
          disable = {},
        },
        -- 증분 선택
        incremental_selection = {
          enable = true,
          keymaps = {
            init_selection = '<C-space>',
            node_incremental = '<C-space>',
            scope_incremental = '<C-s>',
            node_decremental = '<bs>',
          },
        },
        -- 들여쓰기
        indent = {
          enable = true,
        },
        -- 설치할 언어
        ensure_installed = {
          'c', 'cpp', 'css', 'go', 'html', 'javascript', 'json', 'lua', 'python', 'rust', 'typescript', 'vimdoc', 'vim',
        },
      })
     end
  }	
})


