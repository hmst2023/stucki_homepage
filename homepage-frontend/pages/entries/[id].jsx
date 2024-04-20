import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";

export const getStaticPaths = async () => {
    try {
    if (!process.env.NEXT_PUBLIC_FASTAPI_BACKEND) { 
        throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_FASTAPI_BACKEND"') 
     } 
    const res = await fetch(process.env.NEXT_PUBLIC_FASTAPI_BACKEND + '/entries');
    const entries = await res.json()
    const paths = entries.map((entry) => ({
        params: {id:entry._id},
    }));
    return {paths, fallback:"blocking"};
    }
    catch (error) {
        if (error.name==='AbortError'){
          console.log('Possible Timeout')
        } else {
          console.log(`Error Message: ${error.message}`)
        }
        return {paths:[], fallback:'blocking'}
    };
};


export const getStaticProps = async ({params: {id}}) => {
    const res = await fetch(process.env.NEXT_PUBLIC_FASTAPI_BACKEND + `/entries/${id}`);
    const entry = await res.json();
    return {
        props:{entry},
        revalidate:10,
    };
};
const EntryById=({entry}) => {
    const router = useRouter();
    function handleDelete () {
        fetch(process.env.NEXT_PUBLIC_FASTAPI_BACKEND + `/entries/${entry._id}`,{
            method: "Delete"
        })
        .then(response=>console.log(response))
        .then(router.push('/'))
    }

    return(
        <div>
            <p>{entry._id}</p>
            <p>Text: {entry.text}</p>
            <p>{entry.img && <img src={entry.img}/>}</p>
            <p>Timestamp: {entry.timestamp}</p>
            <p>Group-Painting:<Link href={"/groups/"+entry.group_painting}> {entry.group_painting}</Link></p>
            <p>Group-Sequenz: <Link href={"/groups/"+entry.group_sequenz}>{entry.group_sequenz}</Link></p>
            <button onClick={handleDelete}>Delete</button>

        </div>
    );
};

export default EntryById