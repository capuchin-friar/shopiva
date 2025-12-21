import { Pool } from "pg"

export const db = async() => {
    const client = new Pool({
        user: "postgres",
        password: "postgres",
        host: "localhost",
        port: 5432,
        // database: "vine",
    });

    let pool = await client.connect();
    if(pool){
        return pool;
    }else{
        throw new Error("Pool not connected!")
    }
}