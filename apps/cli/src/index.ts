#!/usr/bin/env node

import ExcelJS from "exceljs";

async function main() {
  console.log("hello from @effect-hello/cli");
  const wb = new ExcelJS.Workbook();
  // todo: cli 逻辑
}

main().catch((err) => {
  console.error(err);
});