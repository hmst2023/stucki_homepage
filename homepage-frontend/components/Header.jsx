import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <div className='bg-orange-200 flex flex-row justify-between items-center'>
        <Link href="/">Homepage</Link>
        <Link href="/add">Add</Link>
        <Link href="/account/login">Login</Link>
    </div>
  )
}

export default Header