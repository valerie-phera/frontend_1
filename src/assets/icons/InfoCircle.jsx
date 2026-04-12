const InfoCircle = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10 1.667c-4.583 0-8.333 3.75-8.333 8.333 0 4.584 3.75 8.334 8.333 8.334s8.333-3.75 8.333-8.334c0-4.583-3.75-8.333-8.333-8.333ZM10 13.334V9.167M10.005 6.667h-.008"
    />
  </svg>
)
export default InfoCircle