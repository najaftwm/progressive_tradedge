import React from 'react'

const LoaderComponent = ( ) => {
  return (
    <>
    <div className='fixed flex justify-center items-center w-full h-screen top-0 left-0 right-0 bottom-0 z-[9999] bg-black bg-opacity-50'>
        
        <span className="loader"></span>
    </div>
    </>
  )
}

export default LoaderComponent