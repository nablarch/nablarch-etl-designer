'use strict';

var messages_ja = {
  'Details:': '詳細:',
  'File: {0}': 'ファイル: {0}',
  'Line: {0}': '行: {0}',
  'Column: {0}': 'カラム: {0}',
  'File': 'ファイル',
  'New File': '新規作成',
  'Save...': '上書き保存',
  'Save As...': '名前を付けて保存',
  'Open...': '開く',
  'Exit': '終了',
  'Tool': 'ツール',
  'Export ETL files': '変換',
  'Validate...': 'バリデーション',
  'Settings...': '設定',
  'Settings': '入力候補値の設定',
  'Help ': 'ヘルプ',
  'About...': 'バージョン情報',
  'The data is edited, do you want to save?': '編集されています。保存しますか？',
  'Failed to save a bpmn file.': 'bpmnファイルの保存に失敗しました',
  'Path: {0}': 'パス：{0}',
  'Failed to load a bpmn file.': 'bpmnファイルのロードに失敗しました',
  'bpmn file.': 'bpmnファイル',
  'Save as': '名前を付けて保存',
  'Open': '開く',
  'xml file.': 'xmlファイル',
  'The data is edited, do you want to save and quit?': '編集されています。保存して終了しますか？',
  'Version {0}': 'バージョン {0}',
  'Version Information': 'バージョン情報',
  'ETL Designer': 'ETLデザイナー',
  'Error': 'エラー',
  'An unexpected error occurred.': '予期せぬエラーが発生しました',
  'Yes': 'はい',
  'No': 'いいえ',
  'Cancel': 'キャンセル',
  'No error is detected.': 'エラーは検出されていません',
  'No warning is detected.': '警告は検出されていません',
  '"{0}" is required.': '"{0}" が設定されていません',
  '"{0}" must be integer.': '"{0}" は整数で入力してください',
  'Listener name (ref)': 'Listener名(ref)',
  'Batchlet name (ref)': 'Batchlet名(ref)',
  'Reader name (ref)': 'Reader名(ref)',
  'Writer name (ref)': 'Writer名(ref)',
  'Processor name (ref)': 'Processor名(ref)',
  'Job [Name] must be set.': 'jobの［Name］ が設定されていません',
  'nablarchJobListenerExecutor is not set.': 'nablarchJobListenerExecutor が設定されていません',
  'Step name is required.': 'Stepの名前が設定されていません',
  'The step name is duplicated.': 'Stepの名前が重複しています',
  'Failed to call control-bus API. ({0})': 'control-busのAPIの呼び出しに失敗しました({0})',
  'Job name attribute must be set.': 'jobのname属性を設定してください',
  'Failed to convert the xml file.\n{0}': 'xmlファイルの出力に失敗しました\n {0}',
  'Failed to convert the json file.\n{0}': 'jsonファイルの出力に失敗しました\n {0}',
  'Export is finished successfully.': '出力しました',
  'Failed to load a bpmn file.\n{0}': 'bpmnファイルのロードに失敗しました\n{0}',
  'Validation': 'バリデーション',
  'Warning': '警告',
  'Test result': 'ジョブのテスト実行',
  'The following error occurred during test execution.': 'テスト実行中に以下のエラーが発生しました',
  'Access time out.': 'APIアクセスがタイムアウトしました',
  'Checking...': 'チェック中です...',
  'Check': '再チェック',
  'Close': '閉じる',
  'Config file is not exist.\nFile: {0}': '設定ファイルが存在しません\nファイル: {0}',
  'Config file is invalid.\nFile: {0}': '設定ファイルの構文にエラーがあります\nファイル: {0}'
};

function messageUtil() {
}

var locale;

messageUtil.setLocale = function (val) {
  locale = val;
};

messageUtil.getMessage = function (id, options) {
  var message = id;

  if (locale === 'ja') {
    message = messages_ja[id] || id;
  }

  if (options) {
    for (var i = 0; i < options.length; i++) {
      message = message.replace('{' + i + '}', options[i]);
    }
  }

  return message;
};

module.exports = messageUtil;