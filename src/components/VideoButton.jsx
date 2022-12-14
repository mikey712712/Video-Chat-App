import { Button } from "@chakra-ui/react"
export default function VideoButton({ btnId, btnOnClick, spanText }) {
	return (
		<Button w="fit-content" h="30px" m="0 2px" color="white" backgroundColor="#1B4965" onClick={btnOnClick} id={btnId}>
			{spanText}
		</Button>
	)
}
