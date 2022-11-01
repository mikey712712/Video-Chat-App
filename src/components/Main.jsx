import Contacts from "./Contacts"
import { Routes, Route } from "react-router-dom"
import Login from "./Login"
import Register from "./Register"
import UserSettings from "./UserSettings"
import Account from "./Account"
import Videos from "./Videos"
import UserList from "./UserList"
import ChatPage from "./ChatPage"
import Home from "./Home"
import { useState } from "react"
import { Box } from "@chakra-ui/react"

export default function Main({ user }) {
	const [videoOn, setVideoOn] = useState(null)
	return (
		<Box>
			<Contacts user={user} />
			<Routes>
				<Route path="/" element={<Home user={user} />} />
				<Route path="/chat" element={<ChatPage setVideoOn={setVideoOn} />} />
				<Route path="/register" element={<Register />} />
				<Route path="/login" element={<Login />} />
				<Route path="/userSettings" element={<UserSettings />} />
				<Route path="/account" element={<Account user={user} />} />
				<Route path="/Users" element={<UserList />} />
			</Routes>
			<>
				{videoOn ? (
					<Box position="fixed" w={"100%"} h="100%" top="36px" left="0">
						<Videos setVideoOn={setVideoOn} />
					</Box>
				) : null}
			</>
		</Box>
	)
}

// : videoMode === "small" ? (
//     <Box position="fixed" w="100%" h="100%" top="36px" left="0">
//         <Videos setVideoOn={setVideoOn} />
//     </Box>
// )
