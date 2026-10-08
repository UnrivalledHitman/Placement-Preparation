"""Helpers for the security book: build a small private PKI with the openssl command line."""
import os, subprocess, tempfile


def sh(cmd, cwd):
    subprocess.run(cmd, shell=True, check=True, capture_output=True, cwd=cwd)


def make_pki(d=None):
    """Create ca.crt/key (with CA extensions), server.crt/key (SAN localhost, 127.0.0.1,
    api.meterhub.local) and meter.crt/key (client certificate CN=SM-42). Returns the directory."""
    d = d or tempfile.mkdtemp(prefix='pki-')
    ec = '-newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes'
    sh(f'openssl req -x509 {ec} -days 3650 -keyout ca.key -out ca.crt '
       '-subj "/CN=MeterHub Internal Root CA" '
       '-addext "basicConstraints=critical,CA:TRUE" '
       '-addext "keyUsage=critical,keyCertSign,cRLSign"', d)
    with open(os.path.join(d, 'server.ext'), 'w') as f:
        f.write('subjectAltName=DNS:api.meterhub.local,DNS:localhost,IP:127.0.0.1\n'
                'keyUsage=critical,digitalSignature\nextendedKeyUsage=serverAuth\n')
    with open(os.path.join(d, 'client.ext'), 'w') as f:
        f.write('keyUsage=critical,digitalSignature\nextendedKeyUsage=clientAuth\n')
    for name, cn, ext in [('server', 'api.meterhub.local', 'server.ext'),
                          ('meter', 'SM-42', 'client.ext')]:
        sh(f'openssl req {ec} -keyout {name}.key -out {name}.csr -subj "/CN={cn}"', d)
        sh(f'openssl x509 -req -in {name}.csr -CA ca.crt -CAkey ca.key -CAcreateserial '
           f'-days 90 -extfile {ext} -out {name}.crt', d)
    return d
