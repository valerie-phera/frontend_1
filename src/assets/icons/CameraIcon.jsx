const CameraIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={8}
    height={8}
    fill="none"
    {...props}
  >
    <path
      fill="url(#a)"
      d="M7.72 3.863A3.858 3.858 0 0 1 3.859 7.72 3.856 3.856 0 0 1 0 3.863 3.855 3.855 0 0 1 3.858 0a3.853 3.853 0 0 1 3.863 3.863Z"
    />
    <path
      fill="url(#b)"
      d="M7.72 3.863A3.858 3.858 0 0 1 3.859 7.72 3.856 3.856 0 0 1 0 3.863 3.855 3.855 0 0 1 3.858 0a3.853 3.853 0 0 1 3.863 3.863Z"
      style={{
        mixBlendMode: "multiply",
      }}
    />
    <defs>
      <radialGradient
        id="b"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="translate(3.86 3.86) scale(3.86025)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#231F20" />
        <stop offset={0.2} stopColor="#165068" />
        <stop offset={0.38} stopColor="#0C78A1" />
        <stop offset={0.54} stopColor="#0594CB" />
        <stop offset={0.66} stopColor="#01A6E4" />
        <stop offset={0.73} stopColor="#00ADEE" />
        <stop offset={0.76} stopColor="#01A5E3" />
        <stop offset={0.81} stopColor="#0693C8" />
        <stop offset={0.87} stopColor="#0D749B" />
        <stop offset={0.94} stopColor="#184A5E" />
        <stop offset={1} stopColor="#231F20" />
      </radialGradient>
      <linearGradient
        id="a"
        x1={6.59}
        x2={1.126}
        y1={6.593}
        y2={1.128}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#231F20" />
        <stop offset={0.08} stopColor="#212226" />
        <stop offset={0.2} stopColor="#1F2C37" />
        <stop offset={0.33} stopColor="#1A3C53" />
        <stop offset={0.47} stopColor="#13537B" />
        <stop offset={0.62} stopColor="#0A70AE" />
        <stop offset={0.78} stopColor="#0095EE" />
        <stop offset={0.8} stopColor="#0387D6" />
        <stop offset={0.84} stopColor="#0D689F" />
        <stop offset={0.88} stopColor="#154D71" />
        <stop offset={0.91} stopColor="#1B394E" />
        <stop offset={0.95} stopColor="#1F2A34" />
        <stop offset={0.98} stopColor="#222225" />
        <stop offset={1} stopColor="#231F20" />
      </linearGradient>
    </defs>
  </svg>
)
export default CameraIcon
