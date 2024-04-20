import styled from 'styled-components'
const blubb = Math.random() * 1024
const Button = styled.button`
    background: #BF4F74;
    position: absolute;
    top:${blubb+'px'};
    left: 50px;
    `
export default function Home() {
  return (
      <>
        <div style={{
          backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/e/e0/Grass_at_a_lawn_with_morning_dew_02.jpg")`,
          height: '100vh',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}>
        <button> hello </button>
        <Button> hello2 </Button>
        </div>
      </>
  )
}