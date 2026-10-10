name: Publish website

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Get website code
        uses: actions/checkout@v7

      - name: Set up Node
        uses: actions/setup-node@v7
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm install

      - name: Build website
        run: npm run build

      - name: Configure Pages
        uses: actions/configure-pages@v6

      - name: Upload website
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist

      - name: Publish
        id: deployment
        uses: actions/deploy-pages@v5
