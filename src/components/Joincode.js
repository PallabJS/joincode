import React from "react";

function Joincode({ size }) {
    const j = { color: "yellow", fontSize: size + "pt" };
    const c = { color: "blue", fontSize: size + "pt" };
    const brand_text = {
        fontSize: size - 5 + "pt",
        fontFamily: "Garamond",
        fontWeight: "bold",
        padding: "0px 10px",
        borderRadius: "5px",
        color: "rgb(100, 100, 100)",
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
