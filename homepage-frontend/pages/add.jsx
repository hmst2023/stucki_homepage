import React from 'react'
import { getCookie } from 'cookies-next'
export const getServerSideProps = ({req, res}) => {
  const jwt = getCookie("jwt", {req,res});
  return {props: {jwt}};
}
const add = ({jwt}) => {
  return (
    <div>add {jwt}</div>
  )
}

export default add