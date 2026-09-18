pnpm config set ignore-scripts false
# msw 패키지를 승인합니다. 
# pnpm approve-builds는 대화형이므로 자동으로 선택하기 위해 아래와 같이 처리합니다.
pnpm approve-builds --filter msw
pnpm install
pnpm run storybook
