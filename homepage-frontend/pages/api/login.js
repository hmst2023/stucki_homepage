import cookie from 'cookie'
 
export default async (req, res)=>{
    if (req.method==='POST'){

        const {email, password} = req.body

        const result = await fetch(process.env.NEXT_PUBLIC_FASTAPI_BACKEND + '/users/login', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({email, password})
        })

        const data = await result.json() 
        if (result.ok){
            const jwt = data.token            
            res.status(200).setHeader('Set-Cookie', cookie.serialize(
                'jwt',jwt,
                {
                    path:'/',
                    httpOnly: true,
                    sameSite:'strict',
                    maxAge:2100
                    
                }
            )).json({
                'email':data['email'],
                'jwt':jwt
            })
        } else {
           
            data['error'] = data['detail']
            res.status(401)
            res.json(data)
            return
        }

        
    } else {
        res.setHeader('Allow',['POST'])
        res.status(405).json({message:`Method ${req.method} not allowed`})
        return
    }
}