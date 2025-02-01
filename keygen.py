import os
import time
from eth_account import Account
from multiprocessing import Pool, cpu_count

def generate_chunk(start, end):
    private_keys = []
    addresses = []
    for _ in range(start, end):
        acct = Account.create()
        private_key = acct._private_key.hex()
        address = acct.address
        private_keys.append(private_key)
        addresses.append(address)

    return private_keys, addresses

def main():
    num_keys = 1_000
    n_processes = cpu_count()
    chunk_size = num_keys // n_processes
    tasks = []
    for i in range(n_processes):
        start_idx = i * chunk_size
        end_idx = (i + 1) * chunk_size if i < n_processes - 1 else num_keys
        tasks.append((start_idx, end_idx))

    print(f"Starting generation of {num_keys} key pairs across {n_processes} processes...")
    with Pool(n_processes) as pool:
        results = pool.starmap(generate_chunk, tasks)
    print("Generation complete. Writing to files...")
    with open("keys.txt", "w") as priv_file, open("address.txt", "w") as pub_file:
        for (priv_keys_chunk, addrs_chunk) in results:
            for pk, addr in zip(priv_keys_chunk, addrs_chunk):
                priv_file.write(f"{pk}\n")
                pub_file.write(f"{addr}\n")
    print("Key generation completed. Private and public keys have been saved.")

if __name__ == '__main__':
    main()
