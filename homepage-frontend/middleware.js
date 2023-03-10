
import { NextResponse } from "next/server";


export function middleware(req){    
        
    const url = req.url
    const cookie = req.cookies.get('jwt')
 
    if(url.includes('add') && (cookie===undefined)){      
            return NextResponse.redirect('http://127.0.0.1:3000/account/login')        
    }
    return NextResponse.next()
}