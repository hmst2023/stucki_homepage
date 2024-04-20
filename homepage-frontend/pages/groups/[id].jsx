import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";

export const getStaticPaths = async () => {
    try {
        if (!process.env.NEXT_PUBLIC_FASTAPI_BACKEND) { 
            throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_FASTAPI_BACKEND"') 
         } 
        const res = await fetch(process.env.FASTAPI_BACKEND + '/groups');
        const groups = await res.json()
        const paths = groups.map((group) => ({
            params: {id:group._id},
            }));
        return {paths, fallback:"blocking"};
        }
    catch (error) {
        if (error.name==='AbortError'){
          console.log('Possible Timeout')
        } else {
          console.log(`Error Message: ${error.message}`)
        }
        return {paths:[],fallback:'blocking'}
    };
};

export const getStaticProps = async ({params: {id}}) => {
    const res = await fetch(process.env.FASTAPI_BACKEND + `/groups/${id}`);
    const group = await res.json();
    return {
        props:{group},
        revalidate:10,
    };
};
const GroupById=({group}) => {
    const router = useRouter();
    function handleDelete () {
        fetch(process.env.FASTAPI_BACKEND + `/groups/${group._id}`,{
            method: "Delete"
        })
        .then(response=>console.log(response))
        .then(router.push('/'))
    }
    return(
        <div>
            <p>Name: {group.name}</p>
            <p>Group-Type: {group.group_type}</p>
            <p>Timestamp: {group.timestamp}</p>
            <p>Members: </p><ul>{group.members.map(
                (member)=>{return (<li><Link href={"/entries/"+member}>{member}</Link><br/></li>)}
            )}</ul>
            <button onClick={handleDelete}>Delete</button>

        </div>
    );
};

export default GroupById