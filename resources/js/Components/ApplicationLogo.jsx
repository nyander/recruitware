export default function ApplicationLogo(props) {
    return (
        <div
            {...props}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <span
                style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#F9BA47",
                }}
            >
                Recruit
            </span>
            <span
                style={{
                    fontSize: "20px",
                    fontWeight: "normal",
                    color: "#ffffff",
                }}
            >
                Ware
            </span>
        </div>
    );
}
