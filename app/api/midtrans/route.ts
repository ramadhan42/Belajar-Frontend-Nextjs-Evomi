// app/api/midtrans/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {  // Handler untuk POST request
    try {
        const body = await request.json();  // Mendapatkan body request

        const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {    // URL API Midtrans
            method: 'POST', // Metode HTTP POST
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Masukkan Auth Header dari cURL kamu di sini
                'Authorization': 'Basic TWlkLXNlcnZlci1GN2VEN1VhVzEwcjMtQ0ZhQzE2T0JzNFU6',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json(); // Mendapatkan response dari Midtrans
        return NextResponse.json(data); // Mengembalikan response ke client
    } catch (error) {
        return NextResponse.json({ message: "Server Error", error }, { status: 500 });
    }
}