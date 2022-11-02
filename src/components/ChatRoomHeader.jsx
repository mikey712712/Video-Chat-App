import { Box, Flex, Heading } from "@chakra-ui/react"
import { auth, RealTimeDB } from "../App"
import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"

export default function ChatRoomHeader({ roomNumber }) {
	const link = `Rooms/${roomNumber}`
	const [targetUser, setTargetUser] = useState("")
	const user = auth.currentUser

	useEffect(() => {
		const query = ref(RealTimeDB, link)
		return onValue(query, (snapshot) => {
			const data = snapshot.val()

			if (snapshot.exists()) {
				const messageRecieverUID = data.filter((e) => e !== user.uid)[0]

				onValue(ref(RealTimeDB, `Users/${String(messageRecieverUID)}`), (snapshot) => {
					const messageRecieverData = snapshot.val()[Object.keys(snapshot.val())[0]]
					setTargetUser(messageRecieverData.displayName)
				})
				// setTargetUser()
			}
		})
	}, [roomNumber])
	return (
		<Flex alignItems="center" borderTopRadius="10px" border="1px solid rgba(0,0,0,0.6)" h="fit-content" p="10px">
			<Heading fontSize="1.7em">{targetUser}</Heading>
		</Flex>
	)
}
