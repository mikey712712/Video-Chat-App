import { Avatar, Box, Button, Flex, Heading } from "@chakra-ui/react"
import { auth, RealTimeDB } from "../App"
import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import { createRoom, openUserMedia } from "../functions/FirebaseRTC"
import { createCallRequest } from "../functions/FirebaseRTDB"

export default function ChatRoomHeader({ roomNumber, setVideoOn }) {
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
					setTargetUser(messageRecieverData)
				})
				// setTargetUser()
			}
		})
	}, [roomNumber])
	return (
		<Flex bgColor="white" justify="space-between" alignItems="center" borderTopRadius="10px" border="2px solid #1B4965" w="100%" h="fit-content" p="10px">
			<Flex alignItems="center">
				<Avatar m="0 5px 0 0" />
				<Heading fontSize="1.7em">{targetUser.displayName}</Heading>
			</Flex>
			<Button
				onClick={async () => {
					setVideoOn("full")
					await openUserMedia()
					await createRoom(roomNumber)
					createCallRequest(roomNumber, targetUser.uid)
				}}
				float="right"
			>
				Call
			</Button>
		</Flex>
	)
}
