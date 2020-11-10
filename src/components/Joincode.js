import React from "react";
import '../css/brand.css';

function Joincode({ size }) {
    return (
        <React.Fragment>
            <div className='brand_text'>
                <code className='j_title'>J</code>oin
                <code className='c_title'>C</code>ode
            </div>
            &nbsp; <br />
        </React.Fragment>
    );
}

export default Joincode;
