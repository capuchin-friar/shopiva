

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";



const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
    try{
        const authHeader = request.headers.get("Authorization");
        console.log(authHeader);
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({
                bool: false,
                data: "Unauthorized",
            }, { status: 401 });
        }
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        const decoded = jwt.verify(token, JWT_SECRET!);
        if(!decoded){
            return NextResponse.json({
                bool: false,
                data: "Unauthorized",
            }, { status: 401 });
        }
        
        return NextResponse.json({
            bool: true,
            data: "Authorized",
        });
    }catch(err){
        console.error("Auth error:", err);
        return NextResponse.json({
            bool: false,
            data: err instanceof Error ? err.message : "An error occurred",
        }, { status: 500 });
    }
}