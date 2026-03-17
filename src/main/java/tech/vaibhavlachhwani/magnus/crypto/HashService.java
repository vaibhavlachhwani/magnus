package tech.vaibhavlachhwani.magnus.crypto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
public class HashService {
    @Value("${app.secret-key}")
    private String secretKey;

    public String generateHmac(byte[] data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");

            SecretKeySpec keySpec = new SecretKeySpec(
                    secretKey.getBytes(),
                    "HmacSHA512"
            );

            mac.init(keySpec);

            byte[] rawHmac = mac.doFinal(data);

            return Base64.getEncoder().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC", e);
        }
    }
}
