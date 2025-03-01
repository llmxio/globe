import './styles.css';

import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import createGlobe from 'cobe';
import usePartySocket from 'partysocket/react';

import type { OutgoingMessage } from '../shared';

function App() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [counter, setCounter] = useState(0);
	const positions = useRef<
		Map<
			string,
			{
				location: [number, number];
				size: number;
			}
		>
	>(new Map());
	const socket = usePartySocket({
		room: 'default',
		party: 'globe',
		onMessage(evt) {
			const message = JSON.parse(evt.data as string) as OutgoingMessage;
			if (message.type === 'add-marker') {
				positions.current.set(message.position.id, {
					location: [message.position.lat, message.position.lng],
					size: message.position.id === socket.id ? 0.1 : 0.05,
				});
				setCounter((c) => c + 1);
			} else {
				positions.current.delete(message.id);
				setCounter((c) => (c > 0 ? c - 1 : 0));
				setCounter((c) => (c > 0 ? c - 1 : 0));
			}
		},
	});

	const [dimensions, setDimensions] = useState({ width: 1200, height: 1200 });

	useEffect(() => {
		function handleResize() {
			const size = Math.min(window.innerWidth, 600);
			setDimensions({ width: size * 2, height: size * 2 });
		}
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		let phi = 0;

		const globe = createGlobe(canvasRef.current as HTMLCanvasElement, {
			devicePixelRatio: 2,
			width: dimensions.width,
			height: dimensions.height,
			phi: 0,
			theta: 0,
			dark: 1,
			diffuse: 0.8,
			scale: 1.0,
			mapSamples: 16000,
			mapBrightness: 6,
			baseColor: [0.3, 0.3, 0.3],
			markerColor: [0.1, 0.8, 1],
			glowColor: [1, 1, 1],
			markers: [],
			opacity: 0.7,
			onRender: (state) => {
				state.markers = [...positions.current.values()];
				state.phi = phi;
				phi += 0.002;
				phi += 0.002;
			},
		});

		return () => {
			globe.destroy();
		};
	}, [dimensions]);

	return (
		<div
			className="App"
			style={{
				textAlign: 'center',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
			}}
		>
			{/* The canvas where we'll render the globe */}

			<canvas
				ref={canvasRef}
				style={{
					display: 'block',
					margin: '0 auto',
					width: '100%',
					maxWidth: 600,
					aspectRatio: '1',
				}}
			/>
			{counter !== 0 ? <p>population: {counter}</p> : <p>&nbsp;</p>}
		</div>
	);
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
