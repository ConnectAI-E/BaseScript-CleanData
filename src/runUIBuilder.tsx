import { bitable, FieldType } from "@lark-base-open/js-sdk";

export default async function main(uiBuilder: any) {
  uiBuilder.form((form: any) => ({
    formItems: [
      form.tableSelect('table', { label: '数据表' }),
      form.viewSelect('view', { label: '视图', sourceTable: 'table' }),
      form.fieldSelect('field', {
        label: '数据字段（不选择字段则删除表中所有字段的数据）',
        sourceTable: 'table',
        multiple: true,
        filter: ({ type }: { type: any }) => type === FieldType.Text || type === FieldType.Number || type === FieldType.SingleSelect || type === FieldType.MultiSelect || type === FieldType.DateTime || type === FieldType.Checkbox || type === FieldType.User || type === FieldType.Phone || type === FieldType.Url || type === FieldType.Attachment || type === FieldType.SingleLink || type === FieldType.DuplexLink || type === FieldType.Location || type === FieldType.Checkbox || type === FieldType.GroupChat,
      }),
    ],
    buttons: ['删除'],

  }), async ({ values }: { values: any }) => {
    const { table, view, field } = values;
    console.log(values);

    let cols_count: any = "";
    if (typeof field === 'undefined' || field.length === 0) {
      cols_count = await table.getFieldList();
      cols_count = cols_count.length;
    } else {
      cols_count = field.length;
    }

    const recordIdList = await view.getVisibleRecordIdList();

    console.log(recordIdList);

    uiBuilder.text(`将删除 ` + cols_count + ` 列 ` + recordIdList.length + ` 条记录`);
    uiBuilder.buttons('是否继续删除？', ['确认删除'], async () => {

      uiBuilder.showLoading('正在删除数据...');

var new_recordIdList = grouping(recordIdList, 5000);
    const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))
    const wait = async (startTime: number, index: number) => {
      // 两次批量执行之间间隔 8 秒
      const waitTime = 8000 - (Date.now() - startTime);
      if (waitTime > 0 && index < new_recordIdList.length - 1) {
        await sleep(waitTime);
      }
    }
    if (typeof field === 'undefined' || field.length === 0) { // 如未选择任何字段，执行对整个数据表的清空
      for (let i = 0; i < new_recordIdList.length; i++) {
        const startTime = Date.now();
        await table.deleteRecords(new_recordIdList[i]);
        await wait(startTime, i);
      }
    } else {  // 当选择了字段，只执行对选择字段的清除
      let update_recordsList: any = [];
      let update_fieldsList: any = {};
      for (let i = 0; i < new_recordIdList.length; i++) {
        for (let j = 0; j < new_recordIdList[i].length; j++) {
          field.forEach((field_item: any) => {
            update_fieldsList[field_item.id] = null;
          })
          update_recordsList.push({ recordId: new_recordIdList[i][j], fields: update_fieldsList });
        }
        const startTime = Date.now();
        await table.setRecords(update_recordsList);
        await wait(startTime, i);
        update_recordsList = [];
      }
    }
      uiBuilder.hideLoading();
    });
  });
}

// 分组函数
function grouping(array: any, subGroupLength: any) {
  let index = 0;
  let newArray = [];
  while (index < array.length) {
    newArray.push(array.slice(index, index += subGroupLength));
  }
  return newArray;
}