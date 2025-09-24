{
  "event_message": "POST | 500 | https://jzkuvulxfhtcelpvrxgf.supabase.co/functions/v1/send-activity-notification",
  "id": "141798f7-bba4-4dd1-a43f-9db3132f6708",
  "metadata": [
    {
      "deployment_id": "jzkuvulxfhtcelpvrxgf_7dca2e70-94c6-4adc-9180-e47fb83f0cf2_4",
      "execution_id": "5251281d-3f8f-4073-b5f2-0f661209850a",
      "execution_time_ms": 1851,
      "function_id": "7dca2e70-94c6-4adc-9180-e47fb83f0cf2",
      "project_ref": "jzkuvulxfhtcelpvrxgf",
      "request": [
        {
          "headers": [
            {
              "accept": "*/*",
              "accept_encoding": "gzip, br",
              "connection": "Keep-Alive",
              "content_length": "651",
              "cookie": null,
              "host": "jzkuvulxfhtcelpvrxgf.supabase.co",
              "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
              "x_client_info": "supabase-js-web/2.53.0"
            }
          ],
          "host": "jzkuvulxfhtcelpvrxgf.supabase.co",
          "method": "POST",
          "pathname": "/functions/v1/send-activity-notification",
          "port": null,
          "protocol": "https:",
          "sb": [
            {
              "apikey": [],
              "auth_user": "acec5340-1dbd-4099-9dde-cdb5d2549566",
              "jwt": [
                {
                  "apikey": [
                    {
                      "invalid": null,
                      "payload": [
                        {
                          "algorithm": "HS256",
                          "expires_at": 2069746945,
                          "issuer": "supabase",
                          "key_id": null,
                          "role": "anon",
                          "session_id": null,
                          "signature_prefix": "u1GbCC",
                          "subject": null
                        }
                      ]
                    }
                  ],
                  "authorization": [
                    {
                      "invalid": null,
                      "payload": [
                        {
                          "algorithm": "HS256",
                          "expires_at": 1758754120,
                          "issuer": "https://jzkuvulxfhtcelpvrxgf.supabase.co/auth/v1",
                          "key_id": "emUSw4fJ4ohfSZIx",
                          "role": "authenticated",
                          "session_id": "455c1023-d354-4c60-aab6-8c781a04e805",
                          "signature_prefix": "GoVUGX",
                          "subject": "acec5340-1dbd-4099-9dde-cdb5d2549566"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ],
          "search": null,
          "url": "https://jzkuvulxfhtcelpvrxgf.supabase.co/functions/v1/send-activity-notification"
        }
      ],
      "response": [
        {
          "headers": [
            {
              "content_length": "102",
              "content_type": "application/json",
              "date": "Wed, 24 Sep 2025 21:59:07 GMT",
              "sb_request_id": "01997dbc-be5f-7137-8a9b-873b040a8e00",
              "server": "cloudflare",
              "vary": "Accept-Encoding",
              "x_envoy_upstream_service_time": null,
              "x_sb_compute_multiplier": null,
              "x_sb_edge_region": "eu-west-2",
              "x_sb_resource_multiplier": null,
              "x_served_by": "supabase-edge-runtime"
            }
          ],
          "status_code": 500
        }
      ],
      "version": "4"
    }
  ],
  "timestamp": 1758751147418000
}
