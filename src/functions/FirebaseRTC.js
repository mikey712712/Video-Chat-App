import { db } from "../App"
import { collection, doc, setDoc, addDoc, getDoc, updateDoc, onSnapshot, deleteDoc, getDocs, query } from "firebase/firestore"

const configuration = {
	iceServers: [
		{
			urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
		},
	],
	iceCandidatePoolSize: 10,
}

let peerConnection = null
let localStream = null
let remoteStream = null
let roomDialog = null
let roomId = null

export async function createRoom(newRoomId) {
	const roomsRef = collection(db, "rooms")
	const roomRef = doc(roomsRef, `${newRoomId}`)

	peerConnection = new RTCPeerConnection(configuration)

	registerPeerConnectionListeners()

	localStream.getTracks().forEach((track) => {
		peerConnection.addTrack(track, localStream)
	})

	// Code for collecting ICE candidates below
	const callerCandidatesCollection = collection(roomRef, "callerCandidates")

	peerConnection.addEventListener("icecandidate", async (event) => {
		if (!event.candidate) {
			return
		}
		await addDoc(callerCandidatesCollection, event.candidate.toJSON())
	})
	// Code for collecting ICE candidates above

	// Code for creating a room below
	const offer = await peerConnection.createOffer()
	await peerConnection.setLocalDescription(offer)

	const roomWithOffer = {
		offer: {
			type: offer.type,
			sdp: offer.sdp,
		},
	}
	await setDoc(roomRef, roomWithOffer)
	roomId = roomRef.id
	// Code for creating a room above

	peerConnection.addEventListener("track", (event) => {
		// console.log("Got remote track:", event.streams[0])
		event.streams[0].getTracks().forEach((track) => {
			remoteStream.addTrack(track)
		})
	})

	// Listening for remote session description below
	onSnapshot(roomRef, async (snapshot) => {
		const data = snapshot.data()
		if (!peerConnection.currentRemoteDescription && data && data.answer) {
			const rtcSessionDescription = new RTCSessionDescription(data.answer)
			await peerConnection.setRemoteDescription(rtcSessionDescription)
		}
	})
	// Listening for remote session description above

	// Listen for remote ICE candidates below
	onSnapshot(collection(roomRef, "calleeCandidates"), (snapshot) => {
		snapshot.docChanges().forEach(async (change) => {
			if (change.type === "added") {
				let data = change.doc.data()
				await peerConnection.addIceCandidate(new RTCIceCandidate(data))
			}
		})
	})
	// Listen for remote ICE candidates above
}

export function joinRoom() {
	// document.querySelector("#createBtn").disabled = true
	// document.querySelector("#joinBtn").disabled = true
	// roomDialog.open()
}

export async function joinRoomById(roomId) {
	// console.log(roomId)
	const roomsRef = collection(db, "rooms")
	const roomRef = doc(roomsRef, `${roomId}`)
	const roomSnapshot = await getDoc(roomRef)
	// console.log("Got room:", roomSnapshot.exists())

	if (roomSnapshot.exists) {
		// console.log("Create PeerConnection with configuration: ", configuration)
		peerConnection = new RTCPeerConnection(configuration)
		registerPeerConnectionListeners()
		localStream.getTracks().forEach((track) => {
			peerConnection.addTrack(track, localStream)
		})

		// Code for collecting ICE candidates below
		const calleeCandidatesCollection = collection(roomRef, "calleeCandidates")
		peerConnection.addEventListener("icecandidate", async (event) => {
			if (!event.candidate) {
				// console.log("Got final candidate!")
				return
			}
			// console.log("Got candidate: ", event.candidate)
			await addDoc(calleeCandidatesCollection, event.candidate.toJSON())
		})
		// Code for collecting ICE candidates above

		peerConnection.addEventListener("track", (event) => {
			// console.log("Got remote track:", event.streams[0])
			event.streams[0].getTracks().forEach((track) => {
				// console.log("Add a track to the remoteStream:", track)
				remoteStream.addTrack(track)
			})
		})

		// Code for creating SDP answer below
		const offer = roomSnapshot.data().offer
		// console.log("Got offer:", offer)
		await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
		const answer = await peerConnection.createAnswer()
		// console.log("Created answer:", answer)
		await peerConnection.setLocalDescription(answer)

		const roomWithAnswer = {
			answer: {
				type: answer.type,
				sdp: answer.sdp,
			},
		}
		await updateDoc(roomRef, roomWithAnswer)
		// Code for creating SDP answer above

		// Listening for remote ICE candidates below
		onSnapshot(collection(roomRef, "callerCandidates"), (snapshot) => {
			snapshot.docChanges().forEach(async (change) => {
				if (change.type === "added") {
					let data = change.doc.data()
					// console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`)
					await peerConnection.addIceCandidate(new RTCIceCandidate(data))
				}
			})
		})
		// Listening for remote ICE candidates above
	}
}

export async function openUserMedia() {
	const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
	document.querySelector("#localVideo").srcObject = stream
	localStream = stream
	remoteStream = new MediaStream()
	document.querySelector("#remoteVideo").srcObject = remoteStream

	// console.log("Stream:", document.querySelector("#localVideo").srcObject)
	// document.querySelector("#cameraBtn").disabled = true
	// document.querySelector("#joinBtn").disabled = false
	// document.querySelector("#createBtn").disabled = false
	// document.querySelector("#hangupBtn").disabled = false
}

export async function hangUp() {
	const tracks = document.querySelector("#localVideo")?.srcObject.getTracks()
	tracks?.forEach((track) => {
		track.stop()
	})

	if (remoteStream) {
		remoteStream.getTracks().forEach((track) => track.stop())
	}

	if (peerConnection) {
		peerConnection.close()
	}

	const localVideo = document.querySelector("#localVideo")
	if (localVideo) {
		localVideo.srcObject = null
	}
	const remoteVideo = document.querySelector("#remoteVideo")
	if (remoteVideo) {
		remoteVideo.srcObject = null
	}
	const currentRoom = document.querySelector("#currentRoom")
	if (currentRoom) {
		currentRoom.innerText = ""
	}

	// document.querySelector("#cameraBtn").disabled = false
	// document.querySelector("#joinBtn").disabled = true
	// document.querySelector("#createBtn").disabled = true
	// document.querySelector("#hangupBtn").disabled = true

	// Delete room on hangup
	if (roomId) {
		const roomRef = doc(db, "rooms", `${roomId}`)
		const calleeCandidates = query(collection(roomRef, "calleeCandidates"))
		const calleeQuerySnapshot = await getDocs(calleeCandidates)
		// console.log("calee", calleeCandidates)
		calleeQuerySnapshot.forEach(async (doc) => {
			// doc.data() is never undefined for query doc snapshots
			await deleteDoc(doc)
		})
		const callerCandidates = query(collection(roomRef, "callerCandidates"))
		const callerQuerySnapshot = await getDocs(callerCandidates)
		callerQuerySnapshot.forEach(async (doc) => {
			// doc.data() is never undefined for query doc snapshots
			await deleteDoc(doc)
		})
		await deleteDoc(roomRef)
	}
}

export function registerPeerConnectionListeners() {
	peerConnection.addEventListener("icegatheringstatechange", () => {
		// console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`)
	})

	peerConnection.addEventListener("connectionstatechange", () => {
		// console.log(`Connection state change: ${peerConnection.connectionState}`)
	})

	peerConnection.addEventListener("signalingstatechange", () => {
		// console.log(`Signaling state change: ${peerConnection.signalingState}`)
	})

	peerConnection.addEventListener("iceconnectionstatechange ", () => {
		// console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`)
	})
}
