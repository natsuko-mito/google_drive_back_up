function backUpFiles() {
  // バックアップフォルダを取得
  var backUpFolder = DriveApp.getFolderById(BACK_UP_FOLDER_ID);
  // バックアップするファイルを取得
  var backUpFile = DriveApp.getFileById(BACK_UP_FILE_ID);
  // バックアップするファイルと同一名称のフォルダを作成または取得
  var destFolder = searchFolderByName(backUpFolder, getFolderName(backUpFile.getName()));
  // コピーをバックアップフォルダに入れる
  backUpFile.makeCopy(getBackUpFileName(backUpFile), destFolder);
}

function getBackUpFileName(backUpFile) {
  return getTimeString() + "_" + backUpFile.getName();
}

function getTimeString() {
  return Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyyMMddHHmmss");
}

function searchFolderByName(backUpFolder, folderName) {
  // 同一名のFolderがあれば、それを返す。
  var folderItr = backUpFolder.getFoldersByName(folderName);
  if(folderItr.hasNext()){
    return folderItr.next();
  }
  // 　なければ作る
  return backUpFolder.createFolder(folderName);
}

function testRotateFile(){
  // バックアップフォルダを取得
  var backUpFolder = DriveApp.getFolderById(BACK_UP_FOLDER_ID);
  // バックアップFolder内のFolderを取得。
  var folders = backUpFolder.getFolders();
  while(folders.hasNext()){
    rotateFile(folders.next());
  }
}

function rotateFile(folder) {
  var today = new Date();
  Logger.log(today);
  // バックアップフォルダ内のファイルを取得
  var fileCountItr = folder.getFiles();
  // そもそも１ファイルだったら、ローテートしない。
  var fileCount = 0;
  var latestCreateFile = null;
  var latestUpdateFile = null;
  while(fileCountItr.hasNext()){
    fileCount += 1;
    var file = fileCountItr.next();
    if(fileCount < 2){
      latestCreateFile = file;
      latestUpdateFile = file;
    }else{
      latestCreateFile = file.getDateCreated() > latestCreateFile.getDateCreated() ? file : latestCreateFile;
      latestUpdateFile = file.getLastUpdated() > latestCreateFile.getLastUpdated() ? file : latestUpdateFile;
    }
  }
  
  Logger.log(fileCount);
  Logger.log(latestCreateFile);
  Logger.log(latestUpdateFile);
  
  if(fileCount < 2) return;
  
  var fileItr = folder.getFiles();
  while(fileItr.hasNext()){
    var file = fileItr.next();
    // 保存するファイルでもなく、1ヶ月以上触った形跡も無ければ、削除。
    if(latestCreateFile.getId() === file.getId()) continue;
    if(latestUpdateFile.getId() === file.getId()) continue;
    if(file.getLastUpdated() > today.setFullYear(today.getFullYear() - 1)) continue;
    // 上記条件にはまらないので、削除
    folder.removeFile(file);
  } 
  
}

function getFolderName(fileName) {
  var reg=/(.*)(?:\.([^.]+$))/;
  var result = fileName.match(reg);
  return result === null ? fileName : result[1];
}
