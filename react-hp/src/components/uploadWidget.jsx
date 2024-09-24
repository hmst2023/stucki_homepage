import { useEffect, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';

const UploadWidget = ({ receivedUrl }) => {
    const {auth} = useAuth();
    const cloudinaryRef = useRef();
    const widgetRef = useRef();


    const getSignature = async (callback, params_to_sign)=>{
        const signResponse = await fetch(process.env.REACT_APP_BACKEND_LOCATION+'/users/signature',{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            Authorization : `Bearer ${auth}`
          },
          body:JSON.stringify(params_to_sign)
            });
            callback(await signResponse.json());
    }


  useEffect(() => {
    const options = {
        cloudName: "du2jqqdk2",
        cropping: 'true',
        croppingCoordinatesMode: 'custom',
        uploadSignature: getSignature,
      }

    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(options, function(error, result) {
      if (!error && result.event === "success") {
        receivedUrl(result.info)
     }
    });
  }, []);
  return (
      <button onClick={() => widgetRef.current.open()}>
        Upload File
      </button>
  );


  
};

export default UploadWidget;