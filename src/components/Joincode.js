import React from "react";

function Joincode({ size }) {
    const j = { color: "yellow", fontSize: size + "pt", fontWeight: '1000', fontFamily: 'Cursive' };
    const c = { color: "blue", fontSize: size + "pt", fontWeight: '1000', fontFamily: 'Cursive' };
    const brand_text = {
        fontSize: size - 2 + "pt",
        padding: "0px 10px",
        borderRadius: "2px",
        color: "black",
        backgroundColor: "rgb(200, 200, 200)",
        width: "100%",
        textAlign: "center",
    };
    return (
        <React.Fragment>
            <div style={brand_text}>
                <code style={j}>J</code>oin
                <code style={c}>C</code>ode
            </div>
            &nbsp; <br />
        </React.Fragment>
    );
}

export default Joincode;
