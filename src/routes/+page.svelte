<script lang="ts">
    import {page} from "$app/state"
    import {formatEvent} from "$lib";
    import {onMount} from "svelte";
    import {Button} from "$lib/components/ui/button";
    import {Checkbox} from "$lib/components/ui/checkbox";
    import {Label} from "$lib/components/ui/label";

    const ORG = "Aditya";
    const PROJECT = "adbids-tags"
    const SERVICE_TOKEN = `<token_here>`;

    const USER_A = "aditya.hegde+A@rilldata.com";
    const USER_B = "aditya.hegde+B@rilldata.com";
    const USERS = [
        {label: "No user", email: undefined},
        {label: "User A", email: USER_A},
        {label: "User B", email: USER_B},
    ];
    let selectedEmail = $state<string | undefined>(undefined);

    let navigation = $state(false);

    let iframeUrl = $state("");
    let iframeOrigin = $state("");
    let iframe = $state<HTMLIFrameElement | undefined>(undefined);

    let rillOpen = $derived(page.url.searchParams.get("rill_open"));

    async function loadUrl() {
        const resp = await fetch(
            `http://localhost:8080/v1/orgs/${ORG}/projects/${PROJECT}/iframe`,
            {
                method: "POST",
                body: JSON.stringify({
                    resource: "adbids_metrics_explore",
                    navigation,
                    user_email: selectedEmail
                }),
                headers: {
                    Authorization: `Bearer ${SERVICE_TOKEN}`,
                    "Content-Type": "application/json",
                },
                mode: "cors",
            },
        );
        const urlResp = await resp.json();
        const url = new URL(urlResp.iframeSrc);
        if (rillOpen) url.searchParams.set("open", rillOpen);
        iframeUrl = url.toString();
        iframeOrigin = new URL(iframeUrl).origin;
    }

    function loadUser(newUser: string | undefined) {
        selectedEmail = newUser;
        void loadUrl();
    }

    function toggleNavigation() {
        navigation = !navigation;
        void loadUrl();
    }

    function navigate(page: string) {
        iframe?.contentWindow?.postMessage(
            {
                method: "navigate",
                params: {type: "page", name: page}
            },
            iframeOrigin
        );
    }

    onMount(() => {
        void loadUrl();

        window.addEventListener("message", formatEvent);
        return () => {
            window.removeEventListener("message", formatEvent);
        };
    });
</script>

<div class="flex flex-row gap-2">
  {#each USERS as user (user.email)}
    <Button
      onclick={() => loadUser(user.email)}
    >
      <span class="w-4">{selectedEmail === user.email ? ">" : ""}</span>
      {user.label}
    </Button>
  {/each}
</div>

<div class="flex flex-row gap-2 p-2 items-center">
  <Checkbox checked={navigation} id="navigation" name="navigation" onCheckedChange={toggleNavigation}/>
  <Label class="border" for="navigation">Navigation</Label>
  <Button onclick={() => navigate("home")}>Home</Button>
  <Button onclick={() => navigate("reports")}>Reports</Button>
  <Button onclick={() => navigate("alerts")}>Alerts</Button>
</div>

{#if iframeUrl}
  <iframe
    bind:this={iframe}
    title="rill"
    src={iframeUrl}
    class="w-full h-200 border-accent border">
  </iframe>
{/if}
