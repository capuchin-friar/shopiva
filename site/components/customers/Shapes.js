import { useEffect } from "react"

export default function Shapes(){

    useEffect(() => {
        const container = document.querySelector('.shapes');
        const shapes = document.querySelectorAll('.card');

        shapes.forEach(shape => {
        const x = Math.random() * (container.clientWidth - 660);
        const y = Math.random() * (container.clientHeight - 660);

        shape.style.left = `${x}px`;
        shape.style.top = `${y}px`;
        shape.style.transform += ` rotate(${Math.random() * 360}deg)`;
    }, []);
    })
    return(
        <>
            <div className="card" style={{border: 'none'}}>
                <div className="shape bag" aria-hidden="true"></div>
                {/* <div className="label">Square</div> */}
            </div>


            <div className="card" style={{border: 'none'}}>
                <div className="shape square" aria-hidden="true"></div>
                {/* <div className="label">Square</div> */}
            </div>

            <div className="card" style={{border: 'none'}}>
                <div className="shape circle" aria-hidden="true"></div>
                {/* <div className="label">Circle</div> */}
            </div>

            <div className="card" style={{border: 'none'}}>
                <div className="shape semicircle" aria-hidden="true"></div>
                {/* <div className="label">Semicircle</div> */}
            </div>

            <div className="card" style={{border: 'none'}}>
                {/* <!-- starfish: five .arm children --> */}
                <div className="starfish" role="img" aria-label="starfish shape">
                <div className="arm"></div>
                <div className="arm"></div>
                <div className="arm"></div>
                <div className="arm"></div>
                <div className="arm"></div>
                </div>
                {/* <div className="label">Starfish</div> */}
            </div>
        </>
    )
}