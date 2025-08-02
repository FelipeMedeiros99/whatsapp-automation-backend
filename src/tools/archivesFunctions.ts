import fs from "fs";

export async function writeLogs(data: string){
  try{
    fs.appendFile("logs.txt", data + "\n", (err)=>{})
  }catch(e){
    console.log("Erro ao salvar log: ", e)
  }
}
