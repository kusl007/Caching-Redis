const client=require("./client");

async function init(){
    await client.set("message:1","Hello world");
    // await client.expire("message:1",5);
    const result = await client.get("message:1");
    console.log("Result -> ",result);
}
init();