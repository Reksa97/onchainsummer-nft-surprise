<script>
	import { onMount } from 'svelte';
	import { auth, checkEmailLink } from '$lib/firebase';
	import { fly } from 'svelte/transition';
	import BackgroundCanvas from '$lib/components/BackgroundCanvas.svelte';
	import AuthButtons from '$lib/components/AuthButtons.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import UserDetails from '$lib/components/UserDetails.svelte';
	import ProjectList from '$lib/components/ProjectList.svelte';
	import NftGallery from '$lib/components/NFTGallery.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import { getUserAirdropAddress, LOCAL_STORAGE_ACTIVE_SECTION_KEY } from '$lib/localStorage';
	import { initWagmi } from '$lib/wagmi';

	/**
	 * @type {import("@firebase/auth").User | null}
	 */
	let currentUser = null;
	let authInitialised = false;
	let activeSection = 'profile';
	/**
	 * @type {string | null}
	 */
	let airdropWalletAddress = null;

	auth.onAuthStateChanged(async (user) => {
		currentUser = user;
		airdropWalletAddress = await getUserAirdropAddress(currentUser);
		authInitialised = true;
	});

	onMount(async () => {
		const storedSection = localStorage.getItem(LOCAL_STORAGE_ACTIVE_SECTION_KEY);
		if (storedSection) {
			activeSection = storedSection;
		}

		await checkEmailLink(auth);

		await initWagmi();
	});

	/**
	 * @param {string} section
	 */
	function setActiveSection(section) {
		activeSection = section;
		localStorage.setItem(LOCAL_STORAGE_ACTIVE_SECTION_KEY, section);
	}
</script>

<svelte:head>
	<title>Mint Wave App</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<BackgroundCanvas />
<TopBar {currentUser} {setActiveSection} />

<div class="container">
	<main>
		{#if currentUser}
			{#if activeSection === 'profile'}
				<div in:fly={{ y: 20, duration: 500 }}>
					<UserDetails {currentUser} />
				</div>
			{:else if activeSection === 'projects'}
				<div in:fly={{ y: 20, duration: 500 }}>
					<ProjectList {currentUser} />
				</div>
			{:else if activeSection === 'nfts'}
				<div in:fly={{ y: 20, duration: 500 }}>
					<NftGallery {currentUser} {airdropWalletAddress} />
				</div>
			{/if}
		{:else if !authInitialised}
			<Loader />
		{:else}
			<div class="auth-container" in:fly={{ y: 20, duration: 500 }}>
				<h1 class="gradient-text">Welcome to Mint Wave</h1>
				<p>Sign in to track your collected NFTs or create and manage NFT airdrop projects.</p>
				<AuthButtons />
			</div>
		{/if}
	</main>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 2rem;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
	}

	.auth-container {
		text-align: center;
		align-items: center;
		justify-content: center;
		display: flex;
		flex-direction: column;
		max-width: 400px;
		margin: 0 auto;
	}

	h1 {
		font-size: clamp(1.5rem, 5vw, 2.5rem);
		margin-bottom: 1em;
	}

	.gradient-text {
		background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		font-weight: bold;
	}

	@media (max-width: 600px) {
		.container {
			padding: 1rem;
		}
	}
</style>
