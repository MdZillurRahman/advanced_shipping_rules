import { useParams } from '@remix-run/react';
import React from 'react';

const EditRate = () => {
  const params = useParams();
  const rateId = params;

  console.log(rateId);

  return (
    <div>
      
    </div>
  );
};

export default EditRate;