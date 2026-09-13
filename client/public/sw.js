self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || "New Cody's Plumbing request", {
    body: data.body || "A new service request needs attention.",
    icon: "/assets/codys-icon-512.png",
    badge: "/assets/codys-icon-512.png",
    data: { url: data.url || "/admin" },
    tag: data.requestId || "service-request",
    renotify: true,
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/admin", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if ("focus" in client) { client.navigate(target); return client.focus(); }
    }
    return clients.openWindow(target);
  }));
});
