import React from "react";
import Image from "next/image";

const Landing = () => {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Image
        src="/landing.jpg"
        alt="logo"
        layout="responsive"
        width={1920}
        height={800}
      />
    </div>
  );
};

export default Landing;
