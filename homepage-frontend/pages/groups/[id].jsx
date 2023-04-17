import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";

export const getStaticPaths = async () => {
    const res = await fetch(`http://127.0.0.1:8000/groups`);
    const groups = await res.json()
    const paths = groups.map((group) => ({
        params: {id:group._id},
    }));
    return {paths, fallback:"blocking"};
};

export const getStaticProps = async ({params: {id}}) => {
    const res = await fetch(`http://127.0.0.1:8000/groups/${id}`);
    const group = await res.json();
    return {
        props:{group},
        revalidate:10,
    };
};
const GroupById=({group}) => {
    const router = useRouter();
    function handleDelete () {
        fetch(`http://localhost:8000/groups/${group._id}`,{
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