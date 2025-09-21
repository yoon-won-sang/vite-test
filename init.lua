-- ============================
-- 기본 설정
-- ============================
-- 리더 키를 스페이스바로 설정
vim.g.mapleader = " "

-- 라인 번호 표시
vim.opt.nu = true

-- 상대적 라인 번호 표시 (커서 위치 기준)
vim.opt.rnu = true

-- 탭 관련 설정
vim.opt.tabstop = 2    -- 탭 문자의 너비를 2칸으로 설정
vim.opt.shiftwidth = 2   -- 자동 들여쓰기 시 2칸씩 이동
vim.opt.expandtab = true  -- <Tab> 키를 누르면 탭 문자 대신 공백이 입력되도록 변환

-- 검색 관련 설정
vim.opt.incsearch = true  -- 입력하는 즉시 검색 결과 하이라이트
vim.opt.hlsearch = true  -- 모든 검색 결과 하이라이트 유지

-- 기타 유용한 옵션
vim.opt.termguicolors = true -- 터미널 색상 활성화
vim.opt.clipboard = "unnamedplus" -- 시스템 클립보드와 연동
vim.opt.signcolumn = "yes"  -- 기호 열(sign column) 항상 표시
vim.opt.ignorecase = true -- 검색 시 대소문자 무시

-- Netrw 설정 (LSP 에러 예방)
vim.g.netrw_browse_split = 0
vim.g.netrw_altv = 1
vim.g.netrw_liststyle = 3

-- Yank 하이라이트
vim.api.nvim_create_autocmd("TextYankPost", {
  callback = function() vim.highlight.on_yank() end,
})

-- 붙여넣기 시 탭 문제 해결
-- 'paste' 모드는 자동 들여쓰기 및 기타 형식을 비활성화하여
-- 붙여넣기한 코드가 손상되지 않고 원래 형식을 유지하도록 돕습니다.
-- 일반 모드(Normal Mode)에서 `<leader>p`를 눌러 켜고 끌 수 있습니다.
vim.keymap.set('n', '<leader>p', ':set paste!<CR>', { noremap = true, silent = true, desc = 'Paste Mode Toggle' })

-- ============================
-- lazy.nvim 설치
-- ============================
local lazypath = vim.fn.stdpath("data").."/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- ============================
-- 플러그인 설정
-- ============================
require("lazy").setup({

  -- 아이콘
  {
    "nvim-tree/nvim-web-devicons",
    lazy = true,
  },

  -- 파일 탐색기: nvim-tree
  -- `<leader>e`를 눌러 파일 탐색기를 열고 닫을 수 있습니다.
  {
    "nvim-tree/nvim-tree.lua",
    lazy = false,
    dependencies = { "nvim-tree/nvim-web-devicons" },
    cmd = { "NvimTreeToggle" },
    config = function()
      require("nvim-tree").setup({})
      vim.keymap.set('n', '<leader>e', ':NvimTreeToggle<CR>', { desc = 'NvimTree Toggle' })
    end
  },

  -- nvim-surround
  {
    "kylechui/nvim-surround",
    version = "^3.0.0",
    event = "VeryLazy",
    config = function()
      require("nvim-surround").setup()
    end
  },

  -- lualine
  {
    "nvim-lualine/lualine.nvim",
    event = "VeryLazy",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require("lualine").setup({
        options = {
          theme = "auto", -- 테마를 자동으로 설정
          transparent = true, -- 배경 투명하게 설정
          icons_enabled = true,
        }
      })
    end
  },

  -- telescope
  {
    'nvim-telescope/telescope.nvim',
    tag = '0.1.4',
    dependencies = { 'nvim-lua/plenary.nvim' },
    config = function()
      local builtin = require("telescope.builtin")
      vim.keymap.set('n', '<leader>ff', builtin.find_files, { desc = "Find Files" })
      vim.keymap.set('n', '<leader>fg', builtin.live_grep, { desc = "Live Grep" })
      vim.keymap.set('n', '<leader>fb', builtin.buffers, { desc = "Buffers" })
      vim.keymap.set('n', '<leader>fh', builtin.help_tags, { desc = "Help Tags" })
    end
  },

  -- CamelCaseMotion
  {
    "bkad/CamelCaseMotion",
    config = function()
      vim.g.camelcasemotion_key = "<leader>"
      local modes = { "n", "x", "o" }
      local motions = { "w", "b", "e", "ge" }
      for _, mode in ipairs(modes) do
        for _, motion in ipairs(motions) do
          vim.keymap.set(mode, motion, "<Plug>CamelCaseMotion_" .. motion, { silent = true })
          vim.keymap.set(mode, "<leader>" .. motion, "<Plug>CamelCaseMotion_" .. motion, { silent = true })
        end
      end
    end
  },

  -- EasyMotion
  {
    "easymotion/vim-easymotion",
    config = function()
      vim.g.EasyMotion_do_mapping = 0
      local opts = { noremap = true, silent = true }
      vim.api.nvim_set_keymap("n", "<leader>s", "<Plug>(easymotion-s)", opts)
      vim.api.nvim_set_keymap("n", "<leader>f", "<Plug>(easymotion-f)", opts)
      vim.api.nvim_set_keymap("x", "<leader>s", "<Plug>(easymotion-s)", opts)
      vim.api.nvim_set_keymap("x", "<leader>f", "<Plug>(easymotion-f)", opts)
    end
  },

  -- persistence.nvim
  {
    'folke/persistence.nvim',
    event = "BufReadPre",
    config = function()
      require("persistence").setup({
        dir = vim.fn.stdpath("data") .. "/sessions/",
        options = { "buffers", "curdir", "tabpages", "winsize" },
        auto_save = true,
      })
    end
  },
  -- treesitter
  {
  'nvim-treesitter/nvim-treesitter',
  build = ':TSUpdate',
  config = function()
    require('nvim-treesitter.configs').setup({
      ensure_installed = { "lua", "javascript", "tsx", "typescript", "html", "css" },
      sync_install = false, -- 비동기 설치로 성능 최적화
      highlight = {
        enable = true,
        additional_vim_regex_highlighting = false, -- Treesitter만 사용
        disable = function(lang, buf)
          local max_filesize = 100 * 1024 -- 100 KB
          local ok, stats = pcall(vim.loop.fs_stat, vim.api.nvim_buf_get_name(buf))
          if ok and stats and stats.size > max_filesize then
            return true
          end
        end,
      },
      indent = { enable = true },
      incremental_selection = {
        enable = true,
        keymaps = {
          init_selection = '<C-space>',
          node_incremental = '<C-space>',
          scope_incremental = '<C-s>',
          node_decremental = '<bs>',
        },
      },
    })
  end
  },
  -- mason
  { "williamboman/mason.nvim", 
    config = function()
        require("mason").setup()
    end,
  },

 -- mason-lspconfig + LSP 설정
  {
    "williamboman/mason-lspconfig.nvim",
    dependencies = { "williamboman/mason.nvim", "neovim/nvim-lspconfig" },
    config = function()
      local lspconfig = require("lspconfig")
      local cmp_capabilities = require("cmp_nvim_lsp").default_capabilities()

      local on_attach = function(_, bufnr)
        local opts = { buffer = bufnr, silent = true }
        vim.keymap.set("n", "gd", vim.lsp.buf.definition, opts)
        vim.keymap.set("n", "K", vim.lsp.buf.hover, opts)
        vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename, opts)
        vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, opts)
      end

      require("mason-lspconfig").setup({
        ensure_installed = { "ts_ls", "eslint", "tailwindcss", "html", "cssls" },
        -- eslint 설정을 일반 핸들러에 통합하여 충돌을 방지합니다.
        handlers = {
          ["eslint"] = function()
            lspconfig["eslint"].setup({
              capabilities = cmp_capabilities,
              on_attach = on_attach,
              root_dir = function(fname)
                return require("lspconfig.util").root_pattern(
                  ".eslintrc.js",
                  ".eslintrc.cjs",
                  ".eslintrc.json",
                  "package.json",
                  "eslint.config.js"
                )(fname) or vim.loop.cwd()
              end,
            })
          end,
          -- 다른 모든 서버를 위한 기본 핸들러입니다.
          ["_"] = function(server_name)
            lspconfig[server_name].setup({
              capabilities = cmp_capabilities,
              on_attach = on_attach,
            })
          end,
        }
      })
    end
  }
  ,

  -- null-ls를 대체할 포매터: conform.nvim
  -- 파일 저장 시 자동 포맷팅 기능을 제공합니다.
  {
    "stevearc/conform.nvim",
    event = 'BufWritePre',
    config = function()
      require("conform").setup({
        -- prettier를 포매터로 설정합니다.
        formatters_by_ft = {
          javascript = { "prettier" },
          typescript = { "prettier" },
          javascriptreact = { "prettier" },
          typescriptreact = { "prettier" },
          json = { "prettier" },
          html = { "prettier" },
          css = { "prettier" },
          lua = { "stylua" },
        },
        -- 파일을 저장할 때마다 자동으로 포맷팅합니다.
        format_on_save = {
          timeout_ms = 500,
          lsp_fallback = true,
        },
      })
    end
  },

  -- nvim-cmp
  {
    "hrsh7th/nvim-cmp",
    dependencies = {
      "hrsh7th/cmp-nvim-lsp",
      "hrsh7th/cmp-buffer",
      "hrsh7th/cmp-path",
      "hrsh7th/cmp-cmdline",
      "L3MON4D3/LuaSnip",
      "saadparwaiz1/cmp_luasnip",
    },
    config = function()
      local cmp = require("cmp")
      local luasnip = require("luasnip")

      cmp.setup({
        snippet = { expand = function(args) luasnip.lsp_expand(args.body) end },
        mapping = cmp.mapping.preset.insert({
          ["<C-Space>"] = cmp.mapping.complete(),
          ["<CR>"]      = cmp.mapping.confirm({ select = true }),
          ["<Tab>"]     = cmp.mapping.select_next_item(),
          ["<S-Tab>"]   = cmp.mapping.select_prev_item(),
        }),
        sources = cmp.config.sources({
          { name = "nvim_lsp" },
          { name = "luasnip" },
        }, {
          { name = "buffer" },
        }),
      })
    end
  },
  
  -- colorizer
  -- {
  --   "norcalli/nvim-colorizer.lua",
  --   config = function()
  --     require("colorizer").setup({
  --       filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact", "css", "html" },
  --       user_default_options = {
  --         RGB = true, -- #RGB hex codes
  --         RRGGBB = true, -- #RRGGBB hex codes
  --         names = true, -- "Name" codes like Blue
  --         RRGGBBAA = true, -- #RRGGBBAA hex codes
  --         rgb_fn = true, -- CSS rgb() and rgba() functions
  --         hsl_fn = true, -- CSS hsl() and hsla() functions
  --         css = true, -- Enable all CSS features
  --         css_fn = true, -- Enable all CSS *functions*
  --         mode = "background", -- Set the display mode (background, foreground, or virtualtext)
  --       },
  --     })
  --   end,
  -- },

})
