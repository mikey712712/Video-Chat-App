import { useState } from "react"
import {
	Flex,
	Heading,
	Input,
	Button,
	InputGroup,
	Stack,
	InputLeftElement,
	chakra,
	Box,
	Link,
	Avatar,
	FormControl,
	FormHelperText,
	InputRightElement,
} from "@chakra-ui/react"
import { FaUserAlt, FaLock } from "react-icons/fa"
import { updateProfile } from "firebase/auth"
import { auth } from "../App"
import { useNavigate } from "react-router-dom"
const CFaUserAlt = chakra(FaUserAlt)
const CFaLock = chakra(FaLock)

export default function UserSettings() {
	const navigate = useNavigate()
	const [showPassword, setShowPassword] = useState(false)
	const [formValue, setFormValue] = useState({})
	const [fields, setFields] = useState({})
	const handleShowClick = () => setShowPassword(!showPassword)
	const onType = (event) => {
		const { name, value } = event.target
		setFields({ ...fields, [name]: value })
	}
	const onProfileUpdate = (event) => {
		event.preventDefault()
		setFormValue(fields)
		updateProfile(auth.currentUser, {
			displayName: fields.displayName,
			photoURL: fields.photoURL,
		})
			.then(() => {
				// Profile Updated
				console.log("profile updated")
			})
			.catch((error) => {
				const errorCode = error.code
				const errorMessage = error.message
				console.log(errorCode, errorMessage)
			})
	}

	return (
		<Flex flexDirection="column" width="100wh" height="100vh" backgroundColor="gray.200" justifyContent="center" alignItems="center">
			<Stack flexDir="column" mb="2" justifyContent="center" alignItems="center">
				<Avatar bg="teal.500" />
				<Heading color="teal.400">Welcome</Heading>
				<Box minW={{ base: "90%", md: "468px" }}>
					<form onSubmit={onProfileUpdate}>
						<Stack spacing={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
							<FormControl>
								<InputGroup>
									<InputLeftElement pointerEvents="none" children={<CFaUserAlt color="gray.300" />} />
									<Input type="text" name="displayName" placeholder="Your DisplayName Here" onChange={onType} />
								</InputGroup>
							</FormControl>
							<FormControl>
								<InputGroup>
									<InputLeftElement pointerEvents="none" color="gray.300" children={<CFaLock color="gray.300" />} />
									<Input type="text" name="photoURL" placeholder="Your Photo Link Here" onChange={onType} />
								</InputGroup>
							</FormControl>
							<Button borderRadius={0} type="submit" variant="solid" colorScheme="teal" width="full">
								Submit
							</Button>
						</Stack>
					</form>
				</Box>
			</Stack>
		</Flex>
	)
}
