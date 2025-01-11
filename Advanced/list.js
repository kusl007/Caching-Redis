const client =require("./client")

async function init(){
   const result = await client.lpush("list:1","value1","value2","value3");
   console.log("Result is => ",result);
   const pop=await client.lpop("list:1");
   console.log("Result is => ",pop);

}
init()