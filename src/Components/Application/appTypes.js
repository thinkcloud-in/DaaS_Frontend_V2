import { Globe, Database } from "lucide-react";

// Central registry of deployable application types. Adding a new deployable
// component (e.g. a future "Redis" or "n8n") is a matter of adding one entry
// here — the list page's Deploy buttons, the deploy form, and the detail
// page's panel switch all read from this array instead of hardcoding types.
// apiType links back to the Library upload type these versions come from —
// Open WebUI and Vector DB packages are both uploaded under the single
// "Container" Library type, so both app types filter the Version dropdown
// by that same "container" Library type.
export const APP_TYPES = [
    {
        id:      "openwebui",
        apiType: "container",
        label:   "Open WebUI",
        Icon:    Globe,
        desc:    "Deploy an Open WebUI instance to a connected Kubernetes cluster.",
    },
    {
        id:      "vectordb",
        apiType: "container",
        label:   "Vector DB",
        Icon:    Database,
        desc:    "Deploy a Vector Database instance to a connected Kubernetes cluster.",
    },
];

export const getAppType = (id) => APP_TYPES.find((a) => a.id === id);
