import { useEffect, useState } from "react"
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
	Avatar,
	FormControl,
	FormHelperText,
	InputRightElement,
} from "@chakra-ui/react"
import { FaUserAlt, FaLock } from "react-icons/fa"
import { signInWithEmailAndPassword, browserSessionPersistence, setPersistence } from "firebase/auth"
import { auth } from "../App"
import { Navigate, useNavigate, Link } from "react-router-dom"
const CFaUserAlt = chakra(FaUserAlt)
const CFaLock = chakra(FaLock)

export default function Login({ user }) {
	const navigate = useNavigate()
	useEffect(() => {
		if (user) {
			navigate("/")
		}
	}, [user])
	const [showPassword, setShowPassword] = useState(false)
	const [formValue, setFormValue] = useState({})
	const [fields, setFields] = useState({
		email: "demouser@ga.com",
		password: "demouser",
	})
	const handleShowClick = () => setShowPassword(!showPassword)
	const onType = (event) => {
		const { name, value } = event.target
		setFields({ ...fields, [name]: value })
	}
	const onSignup = (event) => {
		event.preventDefault()
		setFormValue(fields)
		setPersistence(auth, browserSessionPersistence).then(() => {
			signInWithEmailAndPassword(auth, fields.email, fields.password)
				.then((userCredential) => {
					// Signed in
					const newUser = userCredential.user
					// console.log("signedIn", newUser)
					navigate("/")
				})
				.catch((error) => {
					const errorCode = error.code
					const errorMessage = error.message
					// console.log(errorCode, errorMessage)
				})
		})
	}

	return (
		<Flex flexDirection="column" width="100wh" height="100vh" backgroundColor="gray.200" justifyContent="center" alignItems="center">
			<Stack flexDir="column" mb="2" justifyContent="center" alignItems="center">
				<Avatar bg="#0083a3" />
				<Heading fontSize="1.7em" color="#0083a3">
					Welcome to QuickChat
				</Heading>
				<Box minW={{ base: "90%", md: "468px" }}>
					<form onSubmit={onSignup}>
						<Stack spacing={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
							<FormControl>
								<InputGroup>
									<InputLeftElement pointerEvents="none" children={<CFaUserAlt color="gray.300" />} />
									<Input type="email" name="email" placeholder="email address" value={fields.email} onChange={onType} />
								</InputGroup>
							</FormControl>
							<FormControl>
								<InputGroup>
									<InputLeftElement pointerEvents="none" color="gray.300" children={<CFaLock color="gray.300" />} />
									<Input
										type={showPassword ? "text" : "password"}
										name="password"
										placeholder="Password"
										value={fields.password}
										onChange={onType}
									/>
									<InputRightElement width="4.5rem">
										<Button h="1.75rem" size="sm" onClick={handleShowClick}>
											{showPassword ? "Hide" : "Show"}
										</Button>
									</InputRightElement>
								</InputGroup>
								<FormHelperText textAlign="right">
									<Link>forgot password?</Link>
								</FormHelperText>
							</FormControl>
							<Button borderRadius={0} color="white" type="submit" variant="solid" bgColor="#0083a3" width="full">
								Login
							</Button>
						</Stack>
					</form>
				</Box>
			</Stack>
			<Box>
				New to us?{" "}
				<Link to="/register" color="teal.500">
					Sign Up
				</Link>
			</Box>
		</Flex>
	)
}
