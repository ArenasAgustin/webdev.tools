import type { PlaygroundConfig } from "@/types/playground";

export const jsonPlaygroundConfig: PlaygroundConfig = {
  id: "json",
  name: "JSON Tools",
  icon: "fa-code",
  description: "Formatear, minificar y filtrar JSON",
  language: "json",
  example: '{"users":[{},{"id":1,"name":"Juan Pérez","age":28,"email":"juan@example.com","active":true,"roles":["admin","user"]},{"id":2,"name":"María García","age":32,"email":"maria@example.com","active":false,"roles":["user"]},{"id":3,"name":"Carlos López","age":25,"email":"carlos@example.com","active":true,"roles":["user","moderator",""]}],"metadata":{"total":3,"page":1,"timestamp":"2024-01-15T10:30:00Z","other":null},"products":[{"id":"p1","name":"Laptop","price":1200,"category":"electronics"},{"id":"p2","name":"Mouse","price":25,"category":"electronics"},{"id":"p3","name":"Keyboard","price":75,"category":"electronics"}]}',
};
